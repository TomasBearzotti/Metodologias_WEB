// Aggregates every v1 resource router. New entities get mounted here, not in server.ts.
import { Router } from "express";
import moviesRouter from "./movies.routes.js";

const router = Router();

router.use("/movies", moviesRouter);

export default router;
