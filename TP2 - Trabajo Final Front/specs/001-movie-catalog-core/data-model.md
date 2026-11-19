# Data Model: Movie Catalog Core (Fase 1)

**Feature**: `001-movie-catalog-core` | **Phase**: 1 | **Date**: 2026-11-19

Este documento define la estructura de las entidades de datos, esquemas de validación y modelos de persistencia para la Fase 1, asegurando compatibilidad hacia adelante con la Fase 2.

---

## 1. Entidad Principal: `Movie` (Película)

### 1.1 Esquema de Persistencia en MongoDB (Mongoose)

```typescript
import { Schema, model, Document, Model, Types } from "mongoose";

// Subdocumento Review (Preparado para Fase 2)
export interface IMovieReview {
  _id?: Types.ObjectId;
  userId: string;
  userName: string;
  rating: number; // 1 a 5
  comment: string;
  createdAt?: Date;
}

const movieReviewSchema = new Schema<IMovieReview>(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

// Entidad Movie
export interface IMovie {
  title: string;
  synopsis: string;
  director: string;
  year: number;
  genre: string;
  posterUrl: string;
  isAvailable: boolean;
  releaseDate: Date;
  reviews?: IMovieReview[];
}

export interface IMovieDocument extends IMovie, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const movieSchema = new Schema<IMovieDocument>(
  {
    title: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
      maxlength: [150, "El título no puede exceder 150 caracteres"],
    },
    synopsis: {
      type: String,
      required: [true, "La sinopsis es obligatoria"],
      trim: true,
      maxlength: [2000, "La sinopsis no puede exceder 2000 caracteres"],
    },
    director: {
      type: String,
      required: [true, "El director es obligatorio"],
      trim: true,
      maxlength: [100, "El director no puede exceder 100 caracteres"],
    },
    year: {
      type: Number,
      required: [true, "El año de estreno es obligatorio"],
      min: [1888, "El año no puede ser anterior a 1888"],
      max: [new Date().getFullYear() + 2, "Año fuera de rango válido"],
    },
    genre: {
      type: String,
      required: [true, "El género es obligatorio"],
      trim: true,
    },
    posterUrl: {
      type: String,
      required: [true, "La URL del póster es obligatoria"],
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
    // Array embebido listo para Fase 2:
    reviews: {
      type: [movieReviewSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// Índices para optimizar búsquedas y filtros
movieSchema.index({ title: "text", director: "text" });
movieSchema.index({ genre: 1, year: -1 });

const Movie: Model<IMovieDocument> = model<IMovieDocument>(
  "Movie",
  movieSchema,
);
export default Movie;
```

---

## 2. Esquemas de Validación con Zod (Backend & Frontend)

### 2.1 Esquema de Creación y Edición (`backend/src/schemas/movie.schema.ts`)

```typescript
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
    .string({ required_error: "El título es obligatorio" })
    .trim()
    .min(1, "El título no puede estar vacío")
    .max(150, "Máximo 150 caracteres"),
  synopsis: z
    .string({ required_error: "La sinopsis es obligatoria" })
    .trim()
    .min(10, "La sinopsis debe tener al menos 10 caracteres")
    .max(2000, "Máximo 2000 caracteres"),
  director: z
    .string({ required_error: "El director es obligatorio" })
    .trim()
    .min(2, "El nombre del director debe tener al menos 2 caracteres")
    .max(100, "Máximo 100 caracteres"),
  year: z.coerce
    .number({ required_error: "El año es obligatorio" })
    .int("Debe ser un número entero")
    .min(1888, "El año no puede ser anterior a 1888")
    .max(new Date().getFullYear() + 2, "Año fuera de rango"),
  genre: z
    .string({ required_error: "El género es obligatorio" })
    .trim()
    .min(1, "El género es obligatorio"),
  posterUrl: z
    .string({ required_error: "La URL del póster es obligatoria" })
    .trim()
    .url("Debe ser una URL válida"),
  isAvailable: z.boolean().default(true),
  releaseDate: z.coerce.date().default(() => new Date()),
});

// Nota de integración Frontend: en React Hook Form registrar como register("year", { valueAsNumber: true }).
// Nota sobre reviews: se omite en createMovieSchema; Mongoose lo inicializa con default: [] en la base.

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
```

---

## 3. Interfaces de Frontend (`frontend/src/types/movie.ts`)

```typescript
export interface MovieReview {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Movie {
  _id: string;
  title: string;
  synopsis: string;
  director: string;
  year: number;
  genre: string;
  posterUrl: string;
  isAvailable: boolean;
  releaseDate: string;
  reviews: MovieReview[];
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MovieFilters {
  search?: string;
  genre?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "title" | "year";
  sortOrder?: "asc" | "desc";
}
```

---

## 4. Entidades del Módulo de Autenticación (Better Auth)

Las siguientes colecciones son administradas en MongoDB directamente por el adaptador de Better Auth:

- **`user`**: Almacena `{ id, name, email, emailVerified, image, role: "admin" | "user", createdAt, updatedAt }`.
- **`session`**: Almacena `{ id, userId, token, expiresAt, ipAddress, userAgent, createdAt, updatedAt }`.
- **`account`**: Almacena credenciales locales (password hasheado) o vínculos OAuth (GitHub).
- **`verification`**: Tokens de verificación.
