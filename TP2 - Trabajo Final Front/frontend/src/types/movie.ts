export interface MovieReview {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Movie {
  _id: string;
  title: string;
  synopsis: string;
  director: string;
  year: number;
  genre: string;
  posterUrl: string;
  isAvailable: boolean;
  releaseDate: string;
  reviews?: MovieReview[];
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MovieFilters {
  search?: string;
  genre?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "title" | "year";
  sortOrder?: "asc" | "desc";
}
