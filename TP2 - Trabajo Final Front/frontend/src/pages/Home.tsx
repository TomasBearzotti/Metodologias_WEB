import { useState } from "react";
import { useGetMoviesQuery } from "../store/api";
import { MovieCard } from "../components/MovieCard";
import { GENRES } from "../schemas/movie.schema";
import { getErrorMessage } from "../lib/api";

export const Home = () => {
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");

  const { data: response, isLoading, error } = useGetMoviesQuery({
    search: search.trim() || undefined,
    genre: selectedGenre || undefined,
  });

  const movies = response?.data ?? [];
  const total = response?.meta?.total ?? movies.length;

  const handleResetFilters = () => {
    setSearch("");
    setSelectedGenre("");
  };

  return (
    <div className="space-y-6">
      {/* Hero / Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-md">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Catálogo de Películas
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Explorá nuestra colección de cine: busca por título o director y filtrá por tus géneros favoritos.
        </p>

        {/* Controles de Búsqueda y Filtro */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título o director..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <div className="sm:w-64">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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

      {/* Barra de estado / métricas */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-medium text-slate-600">
          {isLoading ? (
            "Buscando películas..."
          ) : (
            <>
              Mostrando <span className="font-semibold text-slate-900">{movies.length}</span>{" "}
              {movies.length === 1 ? "película" : "películas"}
              {Boolean(search || selectedGenre) && ` (de un total de ${total})`}
            </>
          )}
        </p>

        {(search || selectedGenre) && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Limpiar filtros
          </button>
        )}
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
          <p className="text-base font-semibold text-slate-700">
            No se encontraron películas
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {search || selectedGenre
              ? "Probá ajustando los términos de búsqueda o quitando el filtro de género."
              : "Todavía no hay películas cargadas en el catálogo."}
          </p>
          {(search || selectedGenre) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
            >
              Restablecer búsqueda
            </button>
          )}
        </div>
      )}

      {!isLoading && !error && movies.length > 0 && (
        <section className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </section>
      )}
    </div>
  );
};
