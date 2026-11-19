// Aggregates every v1 resource router. New entities get mounted here, not in server.ts.
import { Router } from "express";
import moviesRouter from "./movies.routes.js";
import reviewsRouter from "./reviews.routes.js";

const router = Router();

router.use("/movies", moviesRouter);
router.use("/reviews", reviewsRouter);

export default router;
