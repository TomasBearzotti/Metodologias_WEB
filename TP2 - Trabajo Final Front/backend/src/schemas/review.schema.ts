import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.coerce
    .number()
    .int("La calificación debe ser un número entero")
    .min(1, "La calificación mínima es 1 estrella")
    .max(5, "La calificación máxima es 5 estrellas"),
  comment: z
    .string()
    .trim()
    .min(3, "El comentario debe tener al menos 3 caracteres")
    .max(500, "El comentario no puede exceder 500 caracteres"),
});

export const updateReviewSchema = createReviewSchema.partial().refine(
  (data) => data.rating !== undefined || data.comment !== undefined,
  {
    message: "Debe proveer al menos un campo a modificar (rating o comment)",
  }
);

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
