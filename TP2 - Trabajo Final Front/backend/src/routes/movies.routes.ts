import { Router } from "express";
import {
  listMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} from "../controllers/movies.controller.js";
import {
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviews.controller.js";
import { validateBody } from "../middlewares/validate.js";
import {
  createMovieSchema,
  updateMovieSchema,
} from "../schemas/movie.schema.js";
import {
  createReviewSchema,
  updateReviewSchema,
} from "../schemas/review.schema.js";
import {
  authMiddleware,
  requireRole,
} from "../middlewares/auth.middleware.js";

const router = Router();
const onlyAdmin = [authMiddleware, requireRole("admin")];

// Rutas públicas de consulta
router.get("/", listMovies);
router.get("/:id", getMovieById);

// Sub-rutas de reseñas (cualquier usuario autenticado, con ownership verificado en controller)
router.post("/:id/reviews", authMiddleware, validateBody(createReviewSchema), createReview);
router.put("/:id/reviews/:reviewId", authMiddleware, validateBody(updateReviewSchema), updateReview);
router.delete("/:id/reviews/:reviewId", authMiddleware, deleteReview);

// Rutas protegidas exclusivas para administrador
router.post("/", onlyAdmin, validateBody(createMovieSchema), createMovie);
router.put("/:id", onlyAdmin, validateBody(updateMovieSchema), updateMovie);
router.delete("/:id", onlyAdmin, deleteMovie);

export default router;
