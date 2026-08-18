// Aggregates every v1 resource router. New entities get mounted here, not in server.ts.
import { Router } from "express";
import studentsRouter from "./students.routes";
import teamsRouter from "./teams.routes";

const router = Router();

router.use("/students", studentsRouter);
router.use("/teams", teamsRouter);

export default router;
