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

    res.status(201).json(createdReview);
  } catch (error) {
    console.error(`[reviews] error creating review for movie ${id}:`, error);
    res.status(500).json({
      success: false,
      error: { message: "Error interno al crear la reseña" },
    });
  }
}

export async function updateReview(req: Request, res: Response): Promise<void> {
  const { id, reviewId } = req.params;

  if (!isValidObjectId(id) || !isValidObjectId(reviewId)) {
    res.status(400).json({
      success: false,
      error: { message: "Identificador de película o reseña inválido" },
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

    const review = movie.reviews?.find((r) => r._id?.toString() === reviewId);

    if (!review) {
      res.status(404).json({
        success: false,
        error: { message: "Reseña no encontrada" },
      });
      return;
    }

    // Regla de Autoría (Ownership): solo el autor original puede editar su reseña
    if (review.userId !== req.user.id) {
      res.status(403).json({
        success: false,
        error: { message: "No tienes permisos para modificar esta reseña" },
      });
      return;
    }

    const { rating, comment } = req.body;

    if (rating !== undefined) {
      review.rating = Number(rating);
    }
    if (comment !== undefined) {
      review.comment = String(comment).trim();
    }
    review.updatedAt = new Date();

    await movie.save();

    res.status(200).json(review);
  } catch (error) {
    console.error(`[reviews] error updating review ${reviewId}:`, error);
    res.status(500).json({
      success: false,
      error: { message: "Error interno al actualizar la reseña" },
    });
  }
}

export async function deleteReview(req: Request, res: Response): Promise<void> {
  const { id, reviewId } = req.params;

  if (!isValidObjectId(id) || !isValidObjectId(reviewId)) {
    res.status(400).json({
      success: false,
      error: { message: "Identificador de película o reseña inválido" },
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

    const review = movie.reviews?.find((r) => r._id?.toString() === reviewId);

    if (!review) {
      res.status(404).json({
        success: false,
        error: { message: "Reseña no encontrada" },
      });
      return;
    }

    // Regla de Autoría y Moderación: autor original O rol admin
    const isAuthor = review.userId === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      res.status(403).json({
        success: false,
        error: { message: "No tienes permisos para eliminar esta reseña" },
      });
      return;
    }

    movie.reviews = movie.reviews?.filter((r) => r._id?.toString() !== reviewId);
    await movie.save();

    res.status(204).send();
  } catch (error) {
    console.error(`[reviews] error deleting review ${reviewId}:`, error);
    res.status(500).json({
      success: false,
      error: { message: "Error interno al eliminar la reseña" },
    });
  }
}

export async function getMyReviews(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: { message: "Sesión requerida" },
    });
    return;
  }

  try {
    const myReviews = await Movie.aggregate([
      { $unwind: "$reviews" },
      { $match: { "reviews.userId": req.user.id } },
      { $sort: { "reviews.createdAt": -1 } },
      {
        $project: {
          _id: "$reviews._id",
          movieId: "$_id",
          movieTitle: "$title",
          posterUrl: "$posterUrl",
          genre: "$genre",
          year: "$year",
          rating: "$reviews.rating",
          comment: "$reviews.comment",
          createdAt: "$reviews.createdAt",
          updatedAt: "$reviews.updatedAt",
        },
      },
    ]);

    res.status(200).json(myReviews);
  } catch (error) {
    console.error(`[reviews] error fetching reviews for user ${req.user.id}:`, error);
    res.status(500).json({
      success: false,
      error: { message: "Error interno al obtener tus reseñas" },
    });
  }
}
