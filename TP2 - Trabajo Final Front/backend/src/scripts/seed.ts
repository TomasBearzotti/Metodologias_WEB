import "dotenv/config";
import mongoose from "mongoose";
import { connectMongoDB, disconnectMongoDB } from "../config/db.js";
import { auth } from "../lib/auth.js";
import Movie from "../models/Movie.js";
import { EXTRA_MOVIES } from "./movies-dataset.js";

interface SeedUser {
  email: string;
  password: string;
  name: string;
  role: "admin" | "user";
}

const SEED_USERS: SeedUser[] = [
  {
    email: "admin@movies.com",
    password: "Admin123!",
    name: "Administrador",
    role: "admin",
  },
  {
    email: "user@movies.com",
    password: "User123!",
    name: "Usuario Estándar",
    role: "user",
  },
];

const SEED_MOVIES = [
  {
    title: "Inception",
    synopsis:
      "Dom Cobb es un ladrón capaz de adentrarse en los sueños de la gente para robar sus secretos, a quien se le ofrece una oportunidad de recuperar su vida si logra implantar una idea en el subconsciente de un heredero empresarial.",
    director: "Christopher Nolan",
    year: 2010,
    genre: "Ciencia Ficción",
    posterUrl: "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
    isAvailable: true,
    releaseDate: new Date("2010-07-16"),
  },
  {
    title: "Interstellar",
    synopsis:
      "Un grupo de científicos y exploradores espaciales viaja a través de un agujero de gusano en busca de un nuevo hogar habitable para asegurar la supervivencia de la humanidad.",
    director: "Christopher Nolan",
    year: 2014,
    genre: "Ciencia Ficción",
    posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    isAvailable: true,
    releaseDate: new Date("2014-11-07"),
  },
  {
    title: "El Padrino",
    synopsis:
      "Don Vito Corleone, respetado jefe de una de las cinco familias de la mafia de Nueva York, debe ceder el control de su imperio criminal a su reacio hijo menor Michael tras un atentado contra su vida.",
    director: "Francis Ford Coppola",
    year: 1972,
    genre: "Crimen",
    posterUrl: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    isAvailable: true,
    releaseDate: new Date("1972-03-24"),
  },
  {
    title: "Pulp Fiction",
    synopsis:
      "Las vidas de dos asesinos a sueldo, la esposa de un gángster, un boxeador en decadencia y una pareja de ladrones de poca monta se entrelazan en cuatro relatos de violencia y redención en Los Ángeles.",
    director: "Quentin Tarantino",
    year: 1994,
    genre: "Crimen",
    posterUrl: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    isAvailable: true,
    releaseDate: new Date("1994-10-14"),
  },
  {
    title: "El Viaje de Chihiro",
    synopsis:
      "Una niña de diez años queda atrapada en un mundo mágico habitado por dioses y espíritus, viéndose obligada a trabajar en una casa de baños termales para salvar a sus padres transformados en cerdos.",
    director: "Hayao Miyazaki",
    year: 2001,
    genre: "Animación",
    posterUrl: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    isAvailable: true,
    releaseDate: new Date("2001-07-20"),
  },
  {
    title: "Parasite",
    synopsis:
      "Tanto Gi-taek como su familia están en el paro y malviven en un semisótano. Pero un golpe de suerte hace que su hijo consiga dar clases particulares en la opulenta casa de los Park, dando inicio a un enredo de consecuencias imprevisibles.",
    director: "Bong Joon-ho",
    year: 2019,
    genre: "Suspenso",
    posterUrl: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    isAvailable: true,
    releaseDate: new Date("2019-05-30"),
  },
];

async function seed(): Promise<void> {
  console.log("🌱 [seed] Conectando a MongoDB...");
  await connectMongoDB();

  const userCollection = mongoose.connection.collection("user");

  for (const seedUser of SEED_USERS) {
    const existing = await userCollection.findOne({ email: seedUser.email });

    if (!existing) {
      console.log(`👤 [seed] Creando usuario: ${seedUser.email}...`);
      try {
        await auth.api.signUpEmail({
          body: {
            email: seedUser.email,
            password: seedUser.password,
            name: seedUser.name,
          },
        });

        if (seedUser.role === "admin") {
          await userCollection.updateOne(
            { email: seedUser.email },
            { $set: { role: "admin" } }
          );
          console.log(`👑 [seed] Rol 'admin' asignado a ${seedUser.email}`);
        }
      } catch (err) {
        console.error(`❌ [seed] Error al crear ${seedUser.email}:`, err);
      }
    } else {
      console.log(`ℹ️ [seed] Usuario ${seedUser.email} ya existe.`);
      if (seedUser.role === "admin" && existing.role !== "admin") {
        await userCollection.updateOne(
          { email: seedUser.email },
          { $set: { role: "admin" } }
        );
        console.log(`👑 [seed] Rol actualizado a 'admin' para ${seedUser.email}`);
      }
    }
  }

  const ALL_MOVIES = [...SEED_MOVIES, ...EXTRA_MOVIES];
  console.log(`🎬 [seed] Verificando catálogo de ${ALL_MOVIES.length} películas...`);

  let addedCount = 0;
  for (const movie of ALL_MOVIES) {
    const exists = await Movie.findOne({ title: movie.title });
    if (!exists) {
      await Movie.create(movie);
      addedCount++;
    }
  }

  const totalCount = await Movie.countDocuments();
  if (addedCount > 0) {
    console.log(`✅ [seed] Se insertaron ${addedCount} películas nuevas.`);
  } else {
    console.log(`ℹ️ [seed] Todas las películas del catálogo ya estaban presentes.`);
  }
  console.log(`📊 [seed] Total de películas en la base de datos: ${totalCount}`);

  console.log("✨ [seed] Proceso de inicialización finalizado.");
  await disconnectMongoDB();
  process.exit(0);
}

seed().catch(async (error) => {
  console.error("💥 [seed] Error fatal durante el seed:", error);
  try {
    await disconnectMongoDB();
  } catch {}
  process.exit(1);
});
