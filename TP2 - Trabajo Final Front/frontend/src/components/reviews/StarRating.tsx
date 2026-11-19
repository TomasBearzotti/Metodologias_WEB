import { useState } from "react";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

const StarIcon = ({ filled, className }: { filled: boolean; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const StarRating = ({
  rating,
  onChange,
  maxRating = 5,
  size = "md",
  readOnly = false,
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const currentRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label={`Calificación: ${rating} de ${maxRating} estrellas`}
    >
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= currentRating;

        if (readOnly) {
          return (
            <StarIcon
              key={starValue}
              filled={isFilled}
              className={`${sizeClasses[size]} ${
                isFilled
                  ? "text-amber-400 fill-amber-400"
                  : "text-slate-300 fill-slate-100"
              }`}
            />
          );
        }

        return (
          <button
            key={starValue}
            type="button"
            onClick={() => onChange?.(starValue)}
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(null)}
            className="p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
            aria-label={`${starValue} de ${maxRating} estrellas`}
          >
            <StarIcon
              filled={isFilled}
              className={`${sizeClasses[size]} ${
                isFilled
                  ? "text-amber-400 fill-amber-400"
                  : "text-slate-300 fill-slate-100 hover:text-amber-300"
              } transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
};
