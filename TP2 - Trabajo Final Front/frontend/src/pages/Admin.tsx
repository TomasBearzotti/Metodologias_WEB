import { useState, useRef } from "react";
import { Link, NavLink } from "react-router";
import {
  useGetMoviesQuery,
  useCreateMovieMutation,
  useUpdateMovieMutation,
  useDeleteMovieMutation,
} from "../store/api";
import { MovieForm } from "../components/admin/MovieForm";
import type { Movie } from "../types/movie";
import type { MovieFormValues } from "../schemas/movie.schema";
import { getErrorMessage } from "../lib/api";

const THUMBNAIL_PLACEHOLDER =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=100&q=80";

export const Admin = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const {
    data: response,
    isLoading,
    isFetching,
    error: loadError,
  } = useGetMoviesQuery({
    page,
    limit,
    search: search.trim() || undefined,
  });

  const movies = response?.data ?? [];
  const meta = response?.meta;
  const total = meta?.total ?? movies.length;
  const totalPages = meta?.totalPages ?? 1;

  const [createMovie] = useCreateMovieMutation();
  const [updateMovie] = useUpdateMovieMutation();
  const [deleteMovie] = useDeleteMovieMutation();

  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const formRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
    tableRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  };

  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const handleStartCreate = () => {
    setEditingMovie(null);
    scrollToForm();
  };

  const handleStartEdit = (movie: Movie) => {
    setEditingMovie(movie);
    scrollToForm();
  };

  const handleCancelForm = () => {
    setEditingMovie(null);
    setShowForm(false);
  };

  const handleSave = async (values: MovieFormValues) => {
    setFeedback(null);
    try {
      if (editingMovie) {
        await updateMovie({ id: editingMovie._id, values }).unwrap();
        setFeedback({
          type: "success",
          message: `La película "${values.title}" fue actualizada exitosamente.`,
        });
      } else {
        await createMovie(values).unwrap();
        setFeedback({
          type: "success",
          message: `La película "${values.title}" fue agregada exitosamente al catálogo.`,
        });
      }
      setEditingMovie(null);
      setShowForm(false);
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(err) || "No se pudo guardar la película",
      });
      throw err;
    }
  };

  const handleDelete = async (movie: Movie) => {
    setFeedback(null);
    if (!window.confirm(`¿Estás seguro de que deseás eliminar "${movie.title}" del catálogo?`)) {
      return;
    }

    try {
      await deleteMovie(movie._id).unwrap();
      setFeedback({
        type: "success",
        message: `La película "${movie.title}" fue eliminada del catálogo.`,
      });
      if (editingMovie?._id === movie._id) {
        setEditingMovie(null);
        setShowForm(false);
      }
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(err) || "No se pudo eliminar la película",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Encabezado y Acciones */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Panel de Administración</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestión integral (ABM) del catálogo de películas y control de usuarios y roles
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!showForm && (
            <button
              type="button"
              onClick={handleStartCreate}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <span>+</span> Nueva Película
            </button>
          )}
        </div>
      </div>

      {/* Pestañas de Navegación del Panel de Administración */}
      <div className="flex border-b border-slate-200 gap-2">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `px-5 py-2.5 text-sm font-semibold border-b-2 transition -mb-px flex items-center gap-2 ${
              isActive
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            }`
          }
        >
          <span>🎬</span> Catálogo de Películas
        </NavLink>
        <NavLink
          to="/admin/usuarios"
          className={({ isActive }) =>
            `px-5 py-2.5 text-sm font-semibold border-b-2 transition -mb-px flex items-center gap-2 ${
              isActive
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            }`
          }
        >
          <span>👥</span> Usuarios y Roles
        </NavLink>
      </div>

      {/* Banner de Feedback */}
      {feedback && (
        <div
          role="alert"
          className={`rounded-xl border p-4 text-sm font-medium flex items-center justify-between ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-bold hover:underline"
          >
            ✕ Cerrar
          </button>
        </div>
      )}

      {/* Formulario (Creación o Edición) */}
      {showForm && (
        <div ref={formRef}>
          <MovieForm
            movie={editingMovie}
            onSave={handleSave}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      {/* Listado / Tabla de Gestión */}
      <section ref={tableRef} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/70 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Películas en Inventario ({total})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isLoading ? (
                "Consultando catálogo..."
              ) : (
                <>Mostrando {startItem} - {endItem} de {total} películas</>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Buscador dentro del Admin */}
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Filtrar por título..."
                className="w-44 sm:w-56 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Selector de límite por página */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <label htmlFor="admin-limit">Mostrar:</label>
              <select
                id="admin-limit"
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {showForm && (
              <button
                type="button"
                onClick={handleCancelForm}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cerrar formulario
              </button>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="p-8 text-center text-sm text-slate-500">
            Cargando inventario de películas...
          </div>
        )}

        {loadError && (
          <div className="p-6 text-center text-sm text-red-600">
            {getErrorMessage(loadError)}
          </div>
        )}

        {!isLoading && !loadError && movies.length === 0 && (
          <div className="p-12 text-center text-sm text-slate-500">
            No hay películas registradas en el catálogo. Podés agregar la primera con el botón "+ Nueva Película".
          </div>
        )}

        {!isLoading && !loadError && movies.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-3">Póster</th>
                  <th scope="col" className="px-6 py-3">Título / Director</th>
                  <th scope="col" className="px-6 py-3">Género / Año</th>
                  <th scope="col" className="px-6 py-3">Disponibilidad</th>
                  <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movies.map((movie) => (
                  <tr key={movie._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-3">
                      <img
                        src={movie.posterUrl || THUMBNAIL_PLACEHOLDER}
                        alt={movie.title}
                        className="h-14 w-10 rounded object-cover shadow-sm bg-slate-100"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = THUMBNAIL_PLACEHOLDER;
                        }}
                      />
                    </td>
                    <td className="px-6 py-3">
                      <Link
                        to={`/movies/${movie._id}`}
                        className="font-bold text-slate-900 hover:text-indigo-600 transition"
                      >
                        {movie.title}
                      </Link>
                      <span className="block text-xs text-slate-500">{movie.director}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                        {movie.genre}
                      </span>
                      <span className="block text-xs text-slate-500 mt-0.5">{movie.year}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          movie.isAvailable
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            movie.isAvailable ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />
                        {movie.isAvailable ? "Disponible" : "No disponible"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(movie)}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(movie)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación del Administrador */}
        {!isLoading && !loadError && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-3.5 text-xs">
            <span className="text-slate-500">
              Página <span className="font-bold text-slate-900">{page}</span> de{" "}
              <span className="font-bold text-slate-900">{totalPages}</span> ({total} películas)
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1 || isFetching}
                onClick={() => handlePageChange(page - 1)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ← Anterior
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((p, idx) =>
                  p === "..." ? (
                    <span key={`admin-ellipsis-${idx}`} className="px-1 text-slate-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      disabled={isFetching}
                      onClick={() => handlePageChange(p)}
                      className={`h-7 w-7 rounded-lg font-semibold transition ${
                        p === page
                          ? "bg-indigo-600 text-white"
                          : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                disabled={page >= totalPages || isFetching}
                onClick={() => handlePageChange(page + 1)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
