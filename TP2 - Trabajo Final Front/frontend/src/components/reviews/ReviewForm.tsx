import { useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  reviewFormSchema,
  defaultReviewFormValues,
  type ReviewFormValues,
} from "../../schemas/review.schema";
import { StarRating } from "./StarRating";

interface ReviewFormProps {
  initialValues?: ReviewFormValues;
  onSubmit: (values: ReviewFormValues) => Promise<void>;
  onCancel?: () => void;
  isEditing?: boolean;
}

export const ReviewForm = ({
  initialValues = defaultReviewFormValues,
  onSubmit,
  onCancel,
  isEditing = false,
}: ReviewFormProps) => {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: initialValues,
  });

  const commentValue = useWatch({ control, name: "comment" }) || "";

  const handleFormSubmit = async (values: ReviewFormValues) => {
    try {
      setSubmitError(null);
      await onSubmit(values);
      if (!isEditing) {
        reset(defaultReviewFormValues);
      }
    } catch (err: unknown) {
      if (typeof err === "string") {
        setSubmitError(err);
      } else if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Ocurrió un error al guardar la reseña.");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-900">
          {isEditing ? "Modificar tu Reseña" : "Dejar tu Opinión y Calificación"}
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-600 transition"
          >
            ✕ Cancelar
          </button>
        )}
      </div>

      {submitError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {submitError}
        </div>
      )}

      {/* Selector de Calificación (Estrellas) */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
          Tu Puntuación
        </label>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-3">
              <StarRating
                rating={field.value}
                onChange={field.onChange}
                size="lg"
              />
              <span className="text-sm font-bold text-amber-600">
                {field.value} / 5
              </span>
            </div>
          )}
        />
        {errors.rating && (
          <p className="mt-1 text-xs text-red-600">{errors.rating.message}</p>
        )}
      </div>

      {/* Comentario */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="comment"
            className="text-xs font-semibold uppercase tracking-wider text-slate-500"
          >
            Comentario
          </label>
          <span className="text-xs text-slate-400">
            {commentValue.length} / 500 caracteres
          </span>
        </div>
        <textarea
          id="comment"
          rows={3}
          placeholder="¿Qué te pareció la película? Escribí tu opinión..."
          {...register("comment")}
          className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition resize-y"
        />
        {errors.comment && (
          <p className="mt-1 text-xs text-red-600">{errors.comment.message}</p>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {isSubmitting
            ? "Guardando..."
            : isEditing
            ? "Actualizar Reseña"
            : "Publicar Reseña"}
        </button>
      </div>
    </form>
  );
};
