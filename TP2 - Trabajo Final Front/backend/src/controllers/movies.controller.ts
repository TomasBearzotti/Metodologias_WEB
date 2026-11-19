import { Request, Response } from "express";
import { isValidObjectId, QueryFilter } from "mongoose";
import Movie, { IMovieDocument } from "../models/Movie.js";
import { listMoviesQuerySchema } from "../schemas/movie.schema.js";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function listMovies(req: Request, res: Response): Promise<void> {
  const parsed = listMoviesQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: {
        message: "Parámetros de búsqueda inválidos",
        details: parsed.error.flatten().fieldErrors,
      },
    });
    return;
  }

  const { search, genre, page, limit, sortBy, sortOrder } = parsed.data;

  const filter: QueryFilter<IMovieDocument> = {};

  if (genre && genre.trim() !== "") {
    filter.genre = genre.trim();
  }

  if (search && search.trim() !== "") {
    const safeSearch = escapeRegex(search.trim());
    filter.$or = [
      { title: { $regex: safeSearch, $options: "i" } },
      { director: { $regex: safeSearch, $options: "i" } },
    ];
  }

  try {
    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    const [movies, total] = await Promise.all([
      Movie.find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit),
      Movie.countDocuments(filter),
    ]);

    res.status(200).json({
      data: movies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("[movies] error listing:", error);
    res.status(500).json({
      success: false,
      error: { message: "No se pudieron obtener las películas" },
    });
  }
}

export async function getMovieById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({
      success: false,
      error: { message: "El ID proporcionado no es válido" },
    });
    return;
  }

  try {
    const movie = await Movie.findById(id);

    if (!movie) {
      res.status(404).json({
        success: false,
        error: { message: "Película no encontrada" },
      });
      return;
    }

    res.status(200).json(movie);
  } catch (error) {
    console.error("[movies] error getting by ID:", error);
    res.status(500).json({
      success: false,
      error: { message: "No se pudo obtener la película" },
    });
  }
}
