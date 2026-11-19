import { useState } from "react";
import { useParams, Link } from "react-router";
import {
  useGetMovieByIdQuery,
  useAddReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} from "../store/api";
import { useSession } from "../lib/auth-client";
import { getErrorMessage } from "../lib/api";
import { StarRating } from "../components/reviews/StarRating";
import { ReviewForm } from "../components/reviews/ReviewForm";
import { ReviewList } from "../components/reviews/ReviewList";
import type { MovieReview } from "../types/movie";
import type { ReviewFormValues } from "../schemas/review.schema";

const POSTER_PLACEHOLDER =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80";

export const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: movie, isLoading, error } = useGetMovieByIdQuery(id ?? "", {
    skip: !id,
  });

  const { data: session } = useSession();
  const currentUserId = session?.user?.id ?? null;
  const isAdmin = session?.user?.role === "admin";

  const [addReview] = useAddReviewMutation();
  const [updateReview] = useUpdateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();

  const [posterSrc, setPosterSrc] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<MovieReview | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

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

  const reviews = movie.reviews ?? [];
  const reviewsCount = reviews.length;
  const averageRating =
    reviewsCount > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviewsCount).toFixed(1)
      : null;

  const userHasReviewed = Boolean(
    currentUserId && reviews.some((r) => r.userId === currentUserId)
  );

  const handleCreateReview = async (values: ReviewFormValues) => {
    try {
      setFeedback(null);
      await addReview({ movieId: movie._id, data: values }).unwrap();
      setFeedback({ type: "success", message: "¡Tu reseña ha sido publicada exitosamente!" });
    } catch (err) {
      setFeedback({ type: "error", message: getErrorMessage(err) });
      throw err;
    }
  };

  const handleUpdateReview = async (values: ReviewFormValues) => {
    if (!editingReview) return;
    try {
      setFeedback(null);
      await updateReview({
        movieId: movie._id,
        reviewId: editingReview._id,
        data: values,
      }).unwrap();
      setEditingReview(null);
      setFeedback({ type: "success", message: "Tu reseña fue actualizada correctamente." });
    } catch (err) {
      setFeedback({ type: "error", message: getErrorMessage(err) });
      throw err;
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("¿Estás seguro de que deseás eliminar esta reseña?")) return;
    try {
      setFeedback(null);
      await deleteReview({ movieId: movie._id, reviewId }).unwrap();
      setFeedback({ type: "success", message: "Reseña eliminada con éxito." });
      if (editingReview?._id === reviewId) {
        setEditingReview(null);
      }
    } catch (err) {
      setFeedback({ type: "error", message: getErrorMessage(err) });
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Botón Volver */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
        >
          ← Volver al catálogo
        </Link>
      </div>

      {/* Banner de Feedback */}
      {feedback && (
        <div
          role="alert"
          className={`rounded-2xl border p-4 text-sm font-medium flex items-center justify-between ${
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
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-block rounded-lg bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700">
                  {movie.genre}
                </span>

                {/* Calificación promedio destacada */}
                <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-1.5 border border-amber-200/60">
                  <StarRating
                    rating={averageRating ? Math.round(Number(averageRating)) : 0}
                    readOnly
                    size="sm"
                  />
                  <span className="text-sm font-extrabold text-amber-900">
                    {averageRating ? `${averageRating} / 5` : "Sin calificaciones"}
                  </span>
                  <span className="text-xs text-amber-700 font-medium">
                    ({reviewsCount} {reviewsCount === 1 ? "opinión" : "opiniones"})
                  </span>
                </div>
              </div>

              <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                {movie.title}
              </h1>

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
          </div>
        </div>
      </article>

      {/* Sección Comunitaria de Reseñas */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Reseñas y Opiniones ({reviewsCount})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Calificaciones de la comunidad cinematográfica
            </p>
          </div>

          {averageRating && (
            <div className="text-right">
              <span className="text-xl font-black text-amber-600">{averageRating}</span>
              <span className="text-xs text-slate-400 font-semibold"> / 5.0</span>
            </div>
          )}
        </div>

        {/* Formulario de Reseña (Edición o Creación) */}
        {editingReview ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                Modificando tu reseña
              </span>
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="text-xs text-slate-400 hover:text-slate-600 underline"
              >
                Cancelar edición
              </button>
            </div>
            <ReviewForm
              initialValues={{
                rating: editingReview.rating,
                comment: editingReview.comment,
              }}
              onSubmit={handleUpdateReview}
              onCancel={() => setEditingReview(null)}
              isEditing
            />
          </div>
        ) : session ? (
          userHasReviewed ? (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 text-center text-sm text-indigo-900">
              <p className="font-medium">
                Ya calificaste esta película. Podés modificar o borrar tu opinión usando los controles en tu reseña debajo.
              </p>
            </div>
          ) : (
            <ReviewForm onSubmit={handleCreateReview} />
          )
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 text-center">
            <p className="text-sm font-semibold text-slate-800">
              ¿Querés dejar tu reseña y puntuación?
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Iniciá sesión para calificar esta película y participar de la comunidad.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-700 transition"
            >
              Iniciar Sesión
            </Link>
          </div>
        )}

        {/* Listado de Reseñas */}
        <ReviewList
          reviews={reviews}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onEdit={(r) => setEditingReview(r)}
          onDelete={handleDeleteReview}
        />
      </section>
    </div>
  );
};
