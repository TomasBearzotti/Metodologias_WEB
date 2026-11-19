// Better Auth: reemplaza al auth.controller + JWT a mano de las clases 4 y 5.
// Guarda usuarios, sesiones y cuentas de GitHub y Google en NUESTRO Mongo (colecciones user, session, account).
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} environment variable. Check your .env file (see .env.example).`);
  return value;
}

// Better Auth usa el driver nativo de Mongo (mongoose lo trae como dependencia).
// El cliente conecta solo en la primera consulta. Pasarlo como `client` habilita transacciones (Atlas = replica set).
const client = new MongoClient(requireEnv("MONGODB_URI"));

export const auth = betterAuth({
  // URL publica que ve el navegador: la del FRONT, porque /api llega al back a traves del proxy.
  // El secret se lee solo de BETTER_AUTH_SECRET.
  baseURL: requireEnv("BETTER_AUTH_URL"),
  database: mongodbAdapter(client.db(), { client }),
  emailAndPassword: {
    enabled: true, // hashea con scrypt; minimo 8 caracteres por defecto
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },
  // Si alguien ya registrado con email+password entra con GitHub o Google (mismo email), une las cuentas
  // en vez de tirar account_not_linked. Seguro porque ambos devuelven emails verificados.
  account: {
    accountLinking: { trustedProviders: ["github", "google"] },
  },
  // admin(): agrega user.role ("user" por defecto) y endpoints para listar usuarios y revocar sesiones.
  plugins: [admin()],
});
