import { z } from "zod";

export const GENRES = [
  "Acción",
  "Aventura",
  "Animación",
  "Comedia",
  "Crimen",
  "Documental",
  "Drama",
  "Fantasía",
  "Ciencia Ficción",
  "Terror",
  "Suspenso",
  "Romance",
] as const;

export const movieFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "El título es obligatorio")
    .max(150, "Máximo 150 caracteres"),
  synopsis: z
    .string()
    .trim()
    .min(10, "La sinopsis debe tener al menos 10 caracteres")
    .max(2000, "Máximo 2000 caracteres"),
  director: z
    .string()
    .trim()
    .min(2, "El nombre del director debe tener al menos 2 caracteres")
    .max(100, "Máximo 100 caracteres"),
  year: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(1888, "El año no puede ser anterior a 1888")
    .max(new Date().getFullYear() + 2, "Año fuera de rango"),
  genre: z
    .string()
    .trim()
    .min(1, "El género es obligatorio"),
  posterUrl: z
    .string()
    .trim()
    .url("Debe ser una URL válida"),
  isAvailable: z.boolean().default(true),
  releaseDate: z.string().default(() => new Date().toISOString().split("T")[0]),
});

export type MovieFormValues = z.infer<typeof movieFormSchema>;

export const defaultMovieFormValues: MovieFormValues = {
  title: "",
  synopsis: "",
  director: "",
  year: new Date().getFullYear(),
  genre: GENRES[0],
  posterUrl: "",
  isAvailable: true,
  releaseDate: new Date().toISOString().split("T")[0],
};
