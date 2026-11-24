import { useState } from "react";
import { useGetMoviesQuery } from "../store/api";
import { MovieCard } from "../components/MovieCard";
import { GENRES } from "../schemas/movie.schema";
import { getErrorMessage } from "../lib/api";

export const Home = () => {
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);

  const {
    data: response,
    isLoading,
    isFetching,
    error,
  } = useGetMoviesQuery({
    search: search.trim() || undefined,
    genre: selectedGenre || undefined,
    page,
    limit,
  });

  const movies = response?.data ?? [];
  const meta = response?.meta;
  const total = meta?.total ?? movies.length;
  const totalPages = meta?.totalPages ?? 1;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleGenreChange = (value: string) => {
    setSelectedGenre(value);
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedGenre("");
    setPage(1);
  };

  // Rango actual de elementos visibles
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // Generador de números de página con elipsis
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

  return (
    <div className="space-y-6">
      {/* Hero / Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-md">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Catálogo de Películas
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Explorá nuestra colección de cine: busca por título o director y filtrá por tus géneros
          favoritos.
        </p>

        {/* Controles de Búsqueda y Filtro */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por título o director..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <div className="sm:w-64">
            <select
              value={selectedGenre}
              onChange={(e) => handleGenreChange(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Todos los géneros</option>
              {GENRES.map((g) => (
                <option key={g} value={g} className="bg-slate-900 text-white">
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Barra de estado / métricas y Selector de películas por página */}
      <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-slate-600">
          {isLoading ? (
            "Buscando películas..."
          ) : (
            <>
              Mostrando{" "}
              <span className="font-semibold text-slate-900">
                {startItem} - {endItem}
              </span>{" "}
              de <span className="font-semibold text-slate-900">{total}</span> películas
              {Boolean(search || selectedGenre) && " (con filtros aplicados)"}
            </>
          )}
        </p>

        <div className="flex items-center gap-4">
          {/* Selector de límite por página */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <label htmlFor="limit-select" className="text-slate-500">
              Mostrar:
            </label>
            <select
              id="limit-select"
              value={limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="cursor-pointer rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            >
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
            </select>
          </div>

          {(search || selectedGenre) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-800"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Estados de carga / error / contenido */}
      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="text-sm text-slate-500">Cargando catálogo...</p>
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p className="font-semibold">Ocurrió un error al cargar las películas</p>
          <p className="mt-1 text-sm">{getErrorMessage(error)}</p>
        </div>
      )}

      {!isLoading && !error && movies.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-base font-semibold text-slate-700">No se encontraron películas</p>
          <p className="mt-1 text-sm text-slate-500">
            {search || selectedGenre
              ? "Probá ajustando los términos de búsqueda o quitando el filtro de género."
              : "Todavía no hay películas cargadas en el catálogo."}
          </p>
          {(search || selectedGenre) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              Restablecer búsqueda
            </button>
          )}
        </div>
      )}

      {!isLoading && !error && movies.length > 0 && (
        <>
          <section className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </section>

          {/* Controles de Paginación */}
          {totalPages > 1 && (
            <nav
              aria-label="Paginación del catálogo"
              className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row"
            >
              <div className="text-xs text-slate-500">
                Página <span className="font-bold text-slate-900">{page}</span> de{" "}
                <span className="font-bold text-slate-900">{totalPages}</span> ({total} películas en
                total)
              </div>

              <div className="flex items-center gap-1.5">
                {/* Botón Anterior */}
                <button
                  type="button"
                  disabled={page <= 1 || isFetching}
                  onClick={() => handlePageChange(page - 1)}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Anterior
                </button>

                {/* Números de Página */}
                <div className="hidden items-center gap-1 sm:flex">
                  {getPageNumbers().map((p, idx) =>
                    p === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-xs text-slate-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        disabled={isFetching}
                        onClick={() => handlePageChange(p)}
                        aria-current={p === page ? "page" : undefined}
                        className={`h-8 w-8 rounded-xl text-xs font-semibold transition ${
                          p === page
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                </div>

                {/* Botón Siguiente */}
                <button
                  type="button"
                  disabled={page >= totalPages || isFetching}
                  onClick={() => handlePageChange(page + 1)}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Siguiente →
                </button>
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
};
