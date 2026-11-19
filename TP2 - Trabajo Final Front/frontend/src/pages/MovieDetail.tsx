import { useState } from "react";
import { useParams, Link } from "react-router";
import { useGetMovieByIdQuery } from "../store/api";
import { getErrorMessage } from "../lib/api";

const POSTER_PLACEHOLDER =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80";

export const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: movie, isLoading, error } = useGetMovieByIdQuery(id ?? "", {
    skip: !id,
  });

  const [posterSrc, setPosterSrc] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Cargando detalles de la película...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-800">
        <h2 className="text-xl font-bold">Película no encontrada</h2>
        <p className="mt-2 text-sm text-red-600">
          {error ? getErrorMessage(error) : "El identificador solicitado no corresponde a ninguna película registrada."}
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 transition"
        >
          ← Volver al catálogo
        </Link>
      </div>
    );
  }

  const effectivePoster = posterSrc ?? (movie.posterUrl || POSTER_PLACEHOLDER);
  const formattedDate = movie.releaseDate
    ? new Date(movie.releaseDate).toLocaleDateString("es-AR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Botón Volver */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
        >
          ← Volver al catálogo
        </Link>
      </div>

      {/* Ficha Principal */}
      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-12">
          {/* Columna Póster (5 cols) */}
          <div className="md:col-span-5">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-slate-100 shadow-md">
              <img
                src={effectivePoster}
                alt={movie.title}
                onError={() => setPosterSrc(POSTER_PLACEHOLDER)}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  {movie.year}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${
                    movie.isAvailable
                      ? "bg-emerald-600/90 text-white"
                      : "bg-red-600/90 text-white"
                  }`}
                >
                  {movie.isAvailable ? "Disponible" : "No disponible"}
                </span>
              </div>
            </div>
          </div>

          {/* Columna Información (7 cols) */}
          <div className="flex flex-col justify-between md:col-span-7">
            <div className="space-y-4">
              <div>
                <span className="inline-block rounded-lg bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700">
                  {movie.genre}
                </span>
                <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                  {movie.title}
                </h1>
              </div>

              {/* Ficha técnica compacta */}
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
                <div>
                  <span className="block text-xs font-medium text-slate-400">Director</span>
                  <span className="font-semibold text-slate-800">{movie.director}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-400">Año de estreno</span>
                  <span className="font-semibold text-slate-800">{movie.year}</span>
                </div>
                {formattedDate && (
                  <div className="col-span-2">
                    <span className="block text-xs font-medium text-slate-400">Fecha de lanzamiento</span>
                    <span className="font-medium text-slate-700">{formattedDate}</span>
                  </div>
                )}
              </div>

              {/* Sinopsis */}
              <div className="space-y-2">
                <h2 className="text-base font-bold text-slate-900">Sinopsis</h2>
                <p className="text-sm leading-relaxed text-slate-600 sm:text-base whitespace-pre-line">
                  {movie.synopsis}
                </p>
              </div>
            </div>

            {/* Teaser Fase 2: Reseñas y Puntuaciones */}
            <div className="mt-8 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 p-5 text-sm text-indigo-950">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-indigo-900">Reseñas y Calificaciones</h3>
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                  Fase 2
                </span>
              </div>
              <p className="mt-1 text-xs text-indigo-700/80">
                El sistema de valoraciones comunitarias estará disponible próximamente en la siguiente fase de desarrollo.
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};
