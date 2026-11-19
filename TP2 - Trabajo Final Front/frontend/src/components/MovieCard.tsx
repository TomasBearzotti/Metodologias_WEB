import { useState } from "react";
import { Link } from "react-router";
import type { Movie } from "../types/movie";

const POSTER_PLACEHOLDER =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80";

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard = ({ movie }: MovieCardProps) => {
  const [poster, setPoster] = useState(movie.posterUrl || POSTER_PLACEHOLDER);

  return (
    <Link
      to={`/movies/${movie._id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:scale-[1.02] hover:shadow-lg duration-200"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-100">
        <img
          src={poster}
          alt={movie.title}
          onError={() => setPoster(POSTER_PLACEHOLDER)}
          className="h-full w-full object-cover transition duration-300 group-hover:brightness-105"
          loading="lazy"
        />
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1.5">
          <span className="rounded-full bg-slate-900/80 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
            {movie.year}
          </span>
          {!movie.isAvailable && (
            <span className="rounded-full bg-red-600/90 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              No disponible
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-indigo-600">
          {movie.genre}
        </span>
        <h3 className="line-clamp-1 text-base font-bold text-slate-900 group-hover:text-indigo-600">
          {movie.title}
        </h3>
        <p className="mt-1 line-clamp-1 text-xs text-slate-500">
          Dirigida por <span className="font-medium text-slate-700">{movie.director}</span>
        </p>
        <p className="mt-2 line-clamp-2 text-xs text-slate-600 leading-relaxed">
          {movie.synopsis}
        </p>
      </div>
    </Link>
  );
};
