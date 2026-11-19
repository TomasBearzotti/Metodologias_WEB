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

export const createMovieSchema = z.object({
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
  releaseDate: z.coerce.date().default(() => new Date()),
});

export const updateMovieSchema = createMovieSchema.partial();

export const listMoviesQuerySchema = z.object({
  search: z.string().trim().optional(),
  genre: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "title", "year"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateMovieInput = z.infer<typeof createMovieSchema>;
export type UpdateMovieInput = z.infer<typeof updateMovieSchema>;
export type ListMoviesQuery = z.infer<typeof listMoviesQuerySchema>;
