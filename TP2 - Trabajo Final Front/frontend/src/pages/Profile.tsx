import { useState } from "react";
import { Link } from "react-router";
import { authClient, useSession } from "../lib/auth-client";

export const Profile = () => {
  const { data: session } = useSession();
  const [linkError, setLinkError] = useState<string | null>(null);

  if (!session) return null;
  const { user } = session;
  const isAdmin = user.role === "admin";

  const handleLinkGithub = async () => {
    setLinkError(null);
    const { error } = await authClient.linkSocial({ provider: "github", callbackURL: "/perfil" });
    if (error) {
      setLinkError(error.message ?? "No se pudo conectar la cuenta de GitHub");
    }
  };

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Perfil de Usuario</h1>
        <p className="mt-1 text-sm text-slate-500">
          Información de tu cuenta y permisos asignados en CineCatalog
        </p>
      </div>

      {/* Tarjeta de Datos de Usuario */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 p-6 sm:p-8">
          <div className="flex items-center gap-4">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="h-16 w-16 rounded-full border-2 border-white object-cover shadow"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white shadow">
                {initials}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                    isAdmin
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {user.role ?? "user"}
                </span>
              </div>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Permisos según Rol */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Nivel de Acceso y Permisos
            </h3>
            <p className="mt-1 text-sm text-slate-700">
              {isAdmin
                ? "👑 Rol Administrador: Tenés permisos completos de lectura y escritura (CRUD) sobre las películas del catálogo, administración de roles de usuario y gestión de sesiones activas."
                : "👤 Rol Usuario Estándar: Tenés permisos de lectura y consulta sobre el catálogo público de películas y sus fichas de detalle."}
            </p>
          </div>

          {/* Vinculación Social (GitHub) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Cuentas Vinculadas
            </h3>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <svg className="h-6 w-6 text-slate-800" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <div>
                  <span className="block text-sm font-semibold text-slate-800">GitHub</span>
                  <span className="text-xs text-slate-500">Permite inicio de sesión con 1 clic</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLinkGithub}
                className="rounded-lg border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Conectar GitHub
              </button>
            </div>

            {linkError && (
              <p role="alert" className="text-xs text-red-600">
                {linkError}
              </p>
            )}
          </div>

          {/* Accesos rápidos */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
            <Link
              to="/"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              ← Ir al Catálogo
            </Link>

            <Link
              to="/mis-reseñas"
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition"
            >
              ⭐ Ver Mis Reseñas
            </Link>

            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Panel de Administración
                </Link>
                <Link
                  to="/admin/sesiones"
                  className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                >
                  Auditoría de Sesiones
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
