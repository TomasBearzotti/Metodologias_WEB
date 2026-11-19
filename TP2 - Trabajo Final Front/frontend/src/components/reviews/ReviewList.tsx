import type { MovieReview } from "../../types/movie";
import { StarRating } from "./StarRating";

interface ReviewListProps {
  reviews?: MovieReview[];
  currentUserId?: string | null;
  isAdmin?: boolean;
  onEdit?: (review: MovieReview) => void;
  onDelete?: (reviewId: string) => void;
}

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

export const ReviewList = ({
  reviews = [],
  currentUserId,
  isAdmin = false,
  onEdit,
  onDelete,
}: ReviewListProps) => {
  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
        <MessageSquareIcon className="mx-auto h-8 w-8 text-slate-300 mb-2" />
        <p className="text-sm font-semibold text-slate-700">Sin opiniones todavía</p>
        <p className="mt-1 text-xs text-slate-400">
          Sé el primero en calificar y dejar una reseña para esta película.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const isAuthor = Boolean(currentUserId && review.userId === currentUserId);
        const canDelete = isAuthor || isAdmin;
        const canEdit = isAuthor;

        const formattedDate = new Date(review.createdAt).toLocaleDateString("es-AR", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        return (
          <article
            key={review._id}
            className={`rounded-2xl border p-5 transition shadow-sm ${
              isAuthor
                ? "border-indigo-200 bg-indigo-50/30"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white uppercase">
                  {review.userName ? review.userName.slice(0, 2) : "U"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {review.userName}
                    </span>
                    {isAuthor && (
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                        Tu reseña
                      </span>
                    )}
                  </div>
                  <time className="text-xs text-slate-400">{formattedDate}</time>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                <StarRating rating={review.rating} readOnly size="sm" />

                {(canEdit || canDelete) && (
                  <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                    {canEdit && onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(review)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition"
                        title="Editar tu reseña"
                        aria-label="Editar tu reseña"
                      >
                        <Edit3Icon className="h-4 w-4" />
                      </button>
                    )}
                    {canDelete && onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(review._id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                        title={isAuthor ? "Eliminar tu reseña" : "Eliminar reseña (moderación de admin)"}
                        aria-label="Eliminar reseña"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <p className="mt-3 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {review.comment}
            </p>
          </article>
        );
      })}
    </div>
  );
};
