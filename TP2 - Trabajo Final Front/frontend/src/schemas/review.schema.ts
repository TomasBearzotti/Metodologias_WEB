import { z } from "zod";

export const reviewFormSchema = z.object({
  rating: z
    .number()
    .int("La calificación debe ser un número entero")
    .min(1, "Por favor seleccioná al menos 1 estrella")
    .max(5, "La calificación máxima es 5 estrellas"),
  comment: z
    .string()
    .trim()
    .min(3, "El comentario debe tener al menos 3 caracteres")
    .max(500, "El comentario no puede exceder 500 caracteres"),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export const defaultReviewFormValues: ReviewFormValues = {
  rating: 5,
  comment: "",
};
