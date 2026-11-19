import { useState } from "react";
import { Link } from "react-router";
import {
  useGetMyReviewsQuery,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} from "../store/api";
import { StarRating } from "../components/reviews/StarRating";
import { ReviewForm } from "../components/reviews/ReviewForm";
import { getErrorMessage } from "../lib/api";
import type { UserReviewItem } from "../types/movie";
import type { ReviewFormValues } from "../schemas/review.schema";

const POSTER_PLACEHOLDER =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80";

const Trash2Icon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const Edit3Icon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const MessageSquareIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export const MyReviews = () => {
  const { data: rawReviews, isLoading, error } = useGetMyReviewsQuery();
  const [updateReview] = useUpdateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();

  const myReviews: UserReviewItem[] = Array.isArray(rawReviews)
    ? rawReviews
    : Array.isArray((rawReviews as unknown as { data: UserReviewItem[] })?.data)
    ? (rawReviews as unknown as { data: UserReviewItem[] }).data
    : [];

  const [editingReview, setEditingReview] = useState<UserReviewItem | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleUpdate = async (values: ReviewFormValues) => {
    if (!editingReview) return;
    try {
      setFeedback(null);
      await updateReview({
        movieId: editingReview.movieId,
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

  const handleDelete = async (review: UserReviewItem) => {
    if (!window.confirm(`¿Estás seguro de que deseás eliminar tu reseña sobre "${review.movieTitle}"?`)) {
      return;
    }
    try {
      setFeedback(null);
      await deleteReview({
        movieId: review.movieId,
        reviewId: review._id,
      }).unwrap();
      setFeedback({ type: "success", message: "Reseña eliminada con éxito." });
      if (editingReview?._id === review._id) {
        setEditingReview(null);
      }
    } catch (err) {
      setFeedback({ type: "error", message: getErrorMessage(err) });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Cargando tus reseñas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-800">
        <h2 className="text-lg font-bold">Error al cargar reseñas</h2>
        <p className="mt-2 text-sm text-red-600">{getErrorMessage(error)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Mis Reseñas
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Administrá todas las calificaciones y opiniones que publicaste en la plataforma
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
        >
          ← Explorar más películas
        </Link>
      </div>

      {/* Banner de feedback */}
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

      {/* Modal/Panel de Edición */}
      {editingReview && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                Editando reseña de
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                {editingReview.movieTitle}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setEditingReview(null)}
              className="text-xs text-slate-400 hover:text-slate-600 underline"
            >
              Cancelar
            </button>
          </div>
          <ReviewForm
            initialValues={{
              rating: editingReview.rating,
              comment: editingReview.comment,
            }}
            onSubmit={handleUpdate}
            onCancel={() => setEditingReview(null)}
            isEditing
          />
        </div>
      )}

      {/* Estado vacío */}
      {myReviews.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
          <MessageSquareIcon className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h2 className="text-lg font-bold text-slate-800">
            Aún no has publicado ninguna reseña
          </h2>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            Explorá el catálogo de películas, dejá tu calificación de 1 a 5 estrellas y compartí tu opinión sobre tus obras favoritas.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition"
          >
            Ir al Catálogo de Películas
          </Link>
        </div>
      ) : (
        /* Lista de reseñas propias */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {myReviews.map((review) => {
            const formattedDate = new Date(review.createdAt).toLocaleDateString("es-AR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            return (
              <article
                key={review._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Minipóster */}
                  <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 shadow-sm self-start">
                    <img
                      src={review.posterUrl || POSTER_PLACEHOLDER}
                      alt={review.movieTitle}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = POSTER_PLACEHOLDER;
                      }}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Datos y comentario */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <Link
                            to={`/movies/${review.movieId}`}
                            className="text-base font-bold text-slate-900 hover:text-indigo-600 transition"
                          >
                            {review.movieTitle}
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-400">{review.year}</span>
                            <span className="text-slate-300">•</span>
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                              {review.genre}
                            </span>
                          </div>
                        </div>

                        {/* Botones de acción propios */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingReview(review)}
                            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition"
                            title="Editar reseña"
                          >
                            <Edit3Icon className="h-3.5 w-3.5" />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(review)}
                            className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                            title="Eliminar reseña"
                          >
                            <Trash2Icon className="h-3.5 w-3.5" />
                            Eliminar
                          </button>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center gap-2">
                        <StarRating rating={review.rating} readOnly size="sm" />
                        <span className="text-xs font-bold text-amber-700">
                          {review.rating} / 5
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                        {review.comment}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                      <span>Publicado el {formattedDate}</span>
                      <Link
                        to={`/movies/${review.movieId}`}
                        className="font-medium text-indigo-600 hover:underline"
                      >
                        Ver película →
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
