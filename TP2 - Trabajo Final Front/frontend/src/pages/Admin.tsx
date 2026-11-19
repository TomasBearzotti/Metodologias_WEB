import { Link } from "react-router";

export const Admin = () => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Panel de Administración</h1>
      <p className="mt-2 text-sm text-slate-600">
        Bienvenido al panel de administración.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          to="/admin/sesiones"
          className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
        >
          Gestionar Sesiones y Usuarios →
        </Link>
        <Link
          to="/"
          className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          Ver Catálogo Público
        </Link>
      </div>
    </div>
  );
};
