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
  { _id: true }
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
  }
);

// Índices para optimizar búsquedas y filtros
movieSchema.index({ title: "text", director: "text" });
movieSchema.index({ genre: 1, year: -1 });

const Movie: Model<IMovieDocument> = model<IMovieDocument>("Movie", movieSchema);

export default Movie;
