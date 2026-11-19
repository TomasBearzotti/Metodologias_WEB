import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import Movie from "../models/Movie.js";

export async function createReview(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({
      success: false,
      error: { message: "Identificador de película inválido" },
    });
    return;
  }

  if (!req.user) {
    res.status(401).json({
      success: false,
      error: { message: "Sesión requerida" },
    });
    return;
  }

  try {
    const movie = await Movie.findById(id);

    if (!movie) {
      res.status(404).json({
        success: false,
        error: { message: "Película no encontrada" },
      });
      return;
    }

    // Inicializar array si fuera undefined
    if (!movie.reviews) {
      movie.reviews = [];
    }

    // Regla de unicidad: máximo 1 reseña por usuario y película
    const alreadyReviewed = movie.reviews.some((r) => r.userId === req.user?.id);
    if (alreadyReviewed) {
      res.status(400).json({
        success: false,
        error: { message: "Ya has publicado una reseña para esta película" },
      });
      return;
    }

    const { rating, comment } = req.body;

    const newReviewData = {
      userId: req.user.id,
      userName: req.user.name || "Usuario",
      rating: Number(rating),
      comment: String(comment).trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    movie.reviews.push(newReviewData as any);
    await movie.save();

    const createdReview = movie.reviews[movie.reviews.length - 1];

    res.status(201).json({
      success: true,
      data: createdReview,
    });
  } catch (error) {
    console.error(`[reviews] error creating review for movie ${id}:`, error);
    res.status(500).json({
      success: false,
      error: { message: "Error interno al crear la reseña" },
    });
  }
}
