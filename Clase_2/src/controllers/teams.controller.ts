import { Request, Response } from "express";
import { QueryFilter, isValidObjectId } from "mongoose";
import Team, { ITeam, ITeamDocument } from "../models/Team";

const ALLOWED_SORT_FIELDS = [
  "createdAt",
  "name",
  "sport",
  "foundationYear",
] as const;
type SortField = (typeof ALLOWED_SORT_FIELDS)[number];

interface ListTeamsFilters {
  sport?: string;
  active?: boolean;
  search?: string;
  page: number;
  limit: number;
  sortBy: SortField;
  sortOrder: 1 | -1;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseListTeamsBody(
  body: unknown,
): ListTeamsFilters | { error: string } {
  const input = (body && typeof body === "object" ? body : {}) as Record<
    string,
    unknown
  >;

  const page = Number.isInteger(input.page) ? (input.page as number) : 1;
  const limit = Number.isInteger(input.limit) ? (input.limit as number) : 20;

  if (page < 1) return { error: "page must be >= 1" };
  if (limit < 1 || limit > 100)
    return { error: "limit must be between 1 and 100" };

  const sortBy = typeof input.sortBy === "string" ? input.sortBy : "createdAt";

  if (!ALLOWED_SORT_FIELDS.includes(sortBy as SortField)) {
    return {
      error: `sortBy must be one of: ${ALLOWED_SORT_FIELDS.join(", ")}`,
    };
  }

  const filters: ListTeamsFilters = {
    page,
    limit,
    sortBy: sortBy as SortField,
    sortOrder: input.sortOrder === "asc" ? 1 : -1,
  };

  if (typeof input.sport === "string" && input.sport.trim()) {
    filters.sport = input.sport.trim();
  }

  if (typeof input.active === "boolean") {
    filters.active = input.active;
  }

  if (typeof input.search === "string" && input.search.trim()) {
    filters.search = input.search.trim().slice(0, 120);
  }

  return filters;
}

// QUERY /api/teams
export async function listTeams(req: Request, res: Response): Promise<void> {
  const parsed = parseListTeamsBody(req.body);

  if ("error" in parsed) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const { sport, active, search, page, limit, sortBy, sortOrder } = parsed;
  const filter: QueryFilter<ITeamDocument> = {};

  if (sport) filter.sport = sport;
  if (active !== undefined) filter.active = active;
  if (search) {
    const safeSearch = escapeRegex(search);
    filter.$or = [
      { name: { $regex: safeSearch, $options: "i" } },
      { category: { $regex: safeSearch, $options: "i" } },
    ];
  }

  try {
    const skip = (page - 1) * limit;
    const [teams, total] = await Promise.all([
      Team.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      Team.countDocuments(filter),
    ]);

    res.status(200).json({
      data: teams,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: "Could not fetch teams" });
  }
}

export async function getTeamById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  try {
    const team = await Team.findById(id);
    if (!team) {
      res.status(404).json({ error: "Team not found" });
      return;
    }
    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch the team" });
  }
}

export async function createTeam(
  req: Request<{}, {}, Partial<ITeam>>,
  res: Response,
): Promise<void> {
  try {
    const newTeam = await Team.create(req.body);
    res.status(201).json(newTeam);
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Could not create the team" });
  }
}

export async function updateTeam(
  req: Request<{ id: string }, {}, Partial<ITeam>>,
  res: Response,
): Promise<void> {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  try {
    const updatedTeam = await Team.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedTeam) {
      res.status(404).json({ error: "Team not found" });
      return;
    }
    res.status(200).json(updatedTeam);
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Could not update the team" });
  }
}

export async function deleteTeam(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  try {
    const deletedTeam = await Team.findByIdAndDelete(id);
    if (!deletedTeam) {
      res.status(404).json({ error: "Team not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Could not delete the team" });
  }
}
