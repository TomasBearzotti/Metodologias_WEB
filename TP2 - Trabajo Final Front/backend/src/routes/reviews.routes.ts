import { Router } from "express";
import { getMyReviews } from "../controllers/reviews.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Endpoint para consultar las reseñas del usuario autenticado
router.get("/me", authMiddleware, getMyReviews);

export default router;
