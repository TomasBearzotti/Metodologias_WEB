import { Router } from "express";
import {
  listMaterias,
  getMateriaById,
  createMateria,
  updateMateria,
  deleteMateria,
} from "../controllers/materias.controller";
import { validateBody } from "../middlewares/validate";
import { createMateriaSchema, updateMateriaSchema } from "../schemas/materias.schema";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.get("/", listMaterias);
router.get("/:id", getMateriaById);
router.post("/", requireRole("ADMIN"), validateBody(createMateriaSchema), createMateria);
router.put("/:id", requireRole("ADMIN"), validateBody(updateMateriaSchema), updateMateria);
router.delete("/:id", requireRole("ADMIN"), deleteMateria);

export default router;