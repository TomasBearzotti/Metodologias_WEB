import { Link, NavLink, Outlet } from "react-router";
import { signOut, useSession } from "../lib/auth-client";

export const Layout = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      alert(error.message ?? "No se pudo cerrar sesión");
      return;
    }
    window.location.replace("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 text-white backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Logo y Enlace a Inicio */}
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-white hover:text-indigo-400 transition">
            <span className="text-2xl">🎬</span>
            <span className="tracking-tight">CineCatalog</span>
          </Link>

          {/* Navegación Principal */}
          <nav className="flex items-center gap-3 sm:gap-6 text-sm font-medium">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `transition hover:text-indigo-400 ${
                  isActive ? "text-indigo-400 font-semibold" : "text-slate-300"
                }`
              }
            >
              Catálogo
            </NavLink>

            {user && (
              <NavLink
                to="/mis-reseñas"
                className={({ isActive }) =>
                  `transition hover:text-indigo-400 ${
                    isActive ? "text-indigo-400 font-semibold" : "text-slate-300"
                  }`
                }
              >
                Mis Reseñas
              </NavLink>
            )}

            {isAdmin && (
              <>
                <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) =>
                    `transition hover:text-indigo-400 ${
                      isActive ? "text-indigo-400 font-semibold" : "text-slate-300"
                    }`
                  }
                >
                  Admin
                </NavLink>
                <NavLink
                  to="/admin/usuarios"
                  className={({ isActive }) =>
                    `transition hover:text-indigo-400 ${
                      isActive ? "text-indigo-400 font-semibold" : "text-slate-300"
                    }`
                  }
                >
                  Usuarios y Roles
                </NavLink>
              </>
            )}

            {user ? (
              <div className="flex items-center gap-3 border-l border-slate-700 pl-4 sm:pl-6">
                <Link
                  to="/perfil"
                  className="flex items-center gap-2 hover:text-indigo-300 transition"
                  title="Ver perfil"
                >
                  <span className="max-w-[120px] truncate text-xs text-slate-200 sm:max-w-none">
                    {user.name}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isAdmin
                        ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {user.role ?? "user"}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-red-900/40 hover:text-red-300 transition"
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-slate-700 pl-4 sm:pl-6">
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  Ingresar
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-sm"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>TP2 Metodologías de Desarrollo Web · Catálogo Full Stack de Películas</p>
      </footer>
    </div>
  );
};
