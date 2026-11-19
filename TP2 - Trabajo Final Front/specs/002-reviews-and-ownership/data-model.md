# Data Model: Reseñas, Control de Propiedad y Autenticación (Fase 2)

**Feature**: `002-reviews-and-ownership` | **Date**: 2026-11-19 | **Phase**: 2

Este documento define la estructura de datos, tipos de TypeScript, esquemas Mongoose y validaciones Zod para la capa de reseñas y administración en la Fase 2.

---

## 1. Entidades de Dominio

### 1.1 Subdocumento `MovieReview` (Reseña Embebida)

Almacenado dentro del array `reviews` en cada documento de la colección `movies`.

```typescript
export interface IMovieReview {
  _id?: Types.ObjectId;
  userId: string;        // ID del usuario de Better Auth (inmutable)
  userName: string;      // Nombre visible del autor (inmutable tras creación)
  rating: number;        // Entero entre 1 y 5
  comment: string;       // Texto de opinión (3 a 500 caracteres)
  createdAt: Date;       // Fecha de creación
  updatedAt?: Date;      // Fecha de última modificación
}
```

#### Esquema Mongoose (`backend/src/models/Movie.ts`)
```typescript
const movieReviewSchema = new Schema<IMovieReview>(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    rating: {
      type: Number,
      required: [true, "La calificación es obligatoria"],
      min: [1, "La calificación mínima es 1"],
      max: [5, "La calificación máxima es 5"],
    },
    comment: {
      type: String,
      required: [true, "El comentario es obligatorio"],
      trim: true,
      minlength: [3, "El comentario debe contener al menos 3 caracteres"],
      maxlength: [500, "El comentario no puede superar los 500 caracteres"],
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);
```

---

### 1.2 Entidad `Movie` (Actualización de Tipos)

```typescript
export interface IMovie {
  _id?: string;
  title: string;
  synopsis: string;
  director: string;
  year: number;
  genre: string;
  posterUrl: string;
  isAvailable: boolean;
  releaseDate: Date;
  reviews?: IMovieReview[];
  averageRating?: number; // Calculado dinámicamente o virtual
  reviewsCount?: number;  // Calculado dinámicamente o reviews.length
  createdAt?: string;
  updatedAt?: string;
}
```

---

### 1.3 Proyección `UserReviewItem` (`GET /api/v1/reviews/me`)

Representa la reseña propia enriquecida con los datos esenciales de la película vinculada.

```typescript
export interface UserReviewItem {
  _id: string;          // ID de la reseña
  movieId: string;      // ID de la película
  movieTitle: string;   // Título de la película
  posterUrl: string;    // Póster de la película
  genre: string;        // Género de la película
  year: number;         // Año de la película
  rating: number;       // Calificación otorgada (1 a 5)
  comment: string;      // Comentario del usuario
  createdAt: string;    // Fecha de publicación
  updatedAt?: string;   // Fecha de edición
}
```

---

## 2. Esquemas de Validación Zod

### 2.1 Backend (`backend/src/schemas/review.schema.ts`)

```typescript
import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z
    .number({ required_error: "La calificación es obligatoria" })
    .int("La calificación debe ser un número entero")
    .min(1, "La calificación mínima es 1 estrella")
    .max(5, "La calificación máxima es 5 estrellas"),
  comment: z
    .string({ required_error: "El comentario es obligatorio" })
    .trim()
    .min(3, "El comentario debe tener al menos 3 caracteres")
    .max(500, "El comentario no puede exceder 500 caracteres"),
});

export const updateReviewSchema = z.object({
  rating: z
    .number({ required_error: "La calificación es obligatoria" })
    .int("La calificación debe ser un número entero")
    .min(1, "La calificación mínima es 1 estrella")
    .max(5, "La calificación máxima es 5 estrellas"),
  comment: z
    .string({ required_error: "El comentario es obligatorio" })
    .trim()
    .min(3, "El comentario debe tener al menos 3 caracteres")
    .max(500, "El comentario no puede exceder 500 caracteres"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
```

### 2.2 Frontend (`frontend/src/schemas/review.schema.ts`)

```typescript
import { z } from "zod";

export const reviewFormSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Por favor seleccioná al menos 1 estrella")
    .max(5, "El máximo es 5 estrellas"),
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
```

---

## 3. Matriz de Permisos y Control de Acceso (RBAC + Ownership)

| Recurso / Operación | Anónimo | Usuario Común (`user`) | Propietario (`req.user.id === review.userId`) | Administrador (`admin`) |
| :--- | :---: | :---: | :---: | :---: |
| **Ver reseñas de película** | Permitido | Permitido | Permitido | Permitido |
| **Crear reseña** | 401 | Permitido (1 vez/película) | 400 (si ya creó) | Permitido (1 vez/película) |
| **Editar reseña** | 401 | 403 Forbidden | Permitido | 403 (salvo si es propia) |
| **Eliminar reseña** | 401 | 403 Forbidden | Permitido | Permitido |
| **Consultar mis reseñas** | 401 | Permitido | Permitido | Permitido |
| **Cambiar rol de usuario** | 401 | 403 Forbidden | 403 Forbidden | Permitido |
