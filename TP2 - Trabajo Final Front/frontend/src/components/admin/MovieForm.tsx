import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Movie } from "../../types/movie";
import {
  GENRES,
  defaultMovieFormValues,
  movieFormSchema,
  type MovieFormValues,
} from "../../schemas/movie.schema";

interface MovieFormProps {
  movie: Movie | null;
  onSave: (values: MovieFormValues) => Promise<void>;
  onCancel: () => void;
}

export const MovieForm = ({ movie, onSave, onCancel }: MovieFormProps) => {
  const isEditing = Boolean(movie);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MovieFormValues>({
    resolver: zodResolver(movieFormSchema),
    defaultValues: defaultMovieFormValues,
  });

  const posterPreview = watch("posterUrl");

  useEffect(() => {
    if (movie) {
      reset({
        title: movie.title,
        synopsis: movie.synopsis,
        director: movie.director,
        year: movie.year,
        genre: movie.genre,
        posterUrl: movie.posterUrl,
        isAvailable: movie.isAvailable ?? true,
        releaseDate: movie.releaseDate
          ? new Date(movie.releaseDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
    } else {
      reset(defaultMovieFormValues);
    }
  }, [movie, reset]);

  const onSubmit = async (values: MovieFormValues) => {
    setSaveError(null);
    try {
      await onSave(values);
    } catch (err: unknown) {
      setSaveError(typeof err === "string" ? err : "Error al guardar los datos de la película");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-6"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {isEditing ? `Editar Película: ${movie?.title}` : "Alta de Nueva Película"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEditing
              ? "Modificá los campos necesarios y guardá los cambios."
              : "Completá la ficha técnica para sumar un título al catálogo."}
          </p>
        </div>
        {isEditing && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            Modo Edición
          </span>
        )}
      </div>

      {saveError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
          {saveError}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-12">
        {/* Título (8 cols) */}
        <div className="sm:col-span-8">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Título de la Película *
          </label>
          <input
            type="text"
            placeholder="Ej. Interestelar"
            aria-invalid={Boolean(errors.title)}
            {...register("title")}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-invalid:border-red-500"
          />
          {errors.title && <span className="mt-1 block text-xs text-red-600">{errors.title.message}</span>}
        </div>

        {/* Año (4 cols) */}
        <div className="sm:col-span-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Año de Estreno *
          </label>
          <input
            type="number"
            placeholder="Ej. 2014"
            aria-invalid={Boolean(errors.year)}
            {...register("year", { valueAsNumber: true })}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-invalid:border-red-500"
          />
          {errors.year && <span className="mt-1 block text-xs text-red-600">{errors.year.message}</span>}
        </div>

        {/* Director (6 cols) */}
        <div className="sm:col-span-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Director *
          </label>
          <input
            type="text"
            placeholder="Ej. Christopher Nolan"
            aria-invalid={Boolean(errors.director)}
            {...register("director")}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-invalid:border-red-500"
          />
          {errors.director && <span className="mt-1 block text-xs text-red-600">{errors.director.message}</span>}
        </div>

        {/* Género (6 cols) */}
        <div className="sm:col-span-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Género Cinematográfico *
          </label>
          <select
            aria-invalid={Boolean(errors.genre)}
            {...register("genre")}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-invalid:border-red-500 bg-white"
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          {errors.genre && <span className="mt-1 block text-xs text-red-600">{errors.genre.message}</span>}
        </div>

        {/* URL del Póster (8 cols) */}
        <div className="sm:col-span-8">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            URL del Póster Promocional *
          </label>
          <input
            type="url"
            placeholder="https://image.tmdb.org/t/p/w500/..."
            aria-invalid={Boolean(errors.posterUrl)}
            {...register("posterUrl")}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-invalid:border-red-500"
          />
          {errors.posterUrl && <span className="mt-1 block text-xs text-red-600">{errors.posterUrl.message}</span>}
        </div>

        {/* Fecha de Estreno (4 cols) */}
        <div className="sm:col-span-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Fecha de Lanzamiento
          </label>
          <input
            type="date"
            aria-invalid={Boolean(errors.releaseDate)}
            {...register("releaseDate")}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Sinopsis (12 cols) */}
        <div className="sm:col-span-12">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Sinopsis / Argumento *
          </label>
          <textarea
            rows={4}
            placeholder="Escribí una síntesis del argumento de la película (mínimo 10 caracteres)..."
            aria-invalid={Boolean(errors.synopsis)}
            {...register("synopsis")}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-invalid:border-red-500"
          />
          {errors.synopsis && <span className="mt-1 block text-xs text-red-600">{errors.synopsis.message}</span>}
        </div>

        {/* Disponibilidad y Preview (12 cols) */}
        <div className="sm:col-span-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("isAvailable")}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-slate-800">
              Disponible inmediatamente en el catálogo
            </span>
          </label>

          {posterPreview && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Vista previa del póster:</span>
              <img
                src={posterPreview}
                alt="Vista previa"
                className="h-10 w-7 rounded object-cover border border-slate-200"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
        >
          {isEditing ? "Cancelar edición" : "Limpiar formulario"}
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {isSubmitting
            ? "Guardando película..."
            : isEditing
            ? "Guardar Cambios"
            : "Dar de Alta Película"}
        </button>
      </div>
    </form>
  );
};
