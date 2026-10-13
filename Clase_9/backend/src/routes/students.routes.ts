// Mapping between (HTTP method + path) and controller. No business logic here.
import { Router } from "express";
import {
  listStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/students.controller";
import { validateBody } from "../middlewares/validate";
import { createStudentSchema, listStudentsSchema, updateStudentSchema } from "../schemas/student.schema";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.all("/", (req, res, next) => {
  if (req.method === "QUERY") {
    validateBody(listStudentsSchema)(req, res, () => {
      void listStudents(req, res);
    });
    return;
  }
  next();
});
router.get("/:id", getStudentById);
router.post("/", requireRole("ADMIN"), validateBody(createStudentSchema), createStudent);
router.put("/:id", requireRole("ADMIN"), validateBody(updateStudentSchema), updateStudent);
router.delete("/:id", requireRole("ADMIN"), deleteStudent);

export default router;