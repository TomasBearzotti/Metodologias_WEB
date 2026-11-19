import { Router } from "express";
import {
  listMovies,
  getMovieById,
} from "../controllers/movies.controller.js";

const router = Router();

// Rutas públicas de consulta
router.get("/", listMovies);
router.get("/:id", getMovieById);

export default router;
