import { Router } from "express";
import {
  listTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
} from "../controllers/teams.controller";

const router = Router();

router.query!("/", listTeams);
router.get("/:id", getTeamById);
router.post("/", createTeam);
router.put("/:id", updateTeam);
router.delete("/:id", deleteTeam);

export default router;
