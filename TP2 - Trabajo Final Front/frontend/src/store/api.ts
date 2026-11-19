import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import type { AxiosRequestConfig } from "axios";
import { api as http, getErrorMessage } from "../lib/api";
import type { Movie, MovieFilters, Paginated } from "../types/movie";
import type { MovieFormValues } from "../schemas/movie.schema";

const axiosBaseQuery: BaseQueryFn<AxiosRequestConfig, unknown, string> = async (config) => {
  try {
    const { data } = await http.request(config);
    return { data };
  } catch (err) {
    return { error: getErrorMessage(err) };
  }
};

export const moviesApi = createApi({
  reducerPath: "moviesApi",
  baseQuery: axiosBaseQuery,
  tagTypes: ["Movies"],
  endpoints: (build) => ({
    getMovies: build.query<Paginated<Movie>, MovieFilters | void>({
      query: (params) => ({
        url: "/movies",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["Movies"],
    }),
    getMovieById: build.query<Movie, string>({
      query: (id) => ({ url: `/movies/${id}`, method: "GET" }),
      providesTags: ["Movies"],
    }),
    createMovie: build.mutation<Movie, MovieFormValues>({
      query: (data) => ({ url: "/movies", method: "POST", data }),
      invalidatesTags: ["Movies"],
    }),
    updateMovie: build.mutation<Movie, { id: string; values: Partial<MovieFormValues> }>({
      query: ({ id, values }) => ({ url: `/movies/${id}`, method: "PUT", data: values }),
      invalidatesTags: ["Movies"],
    }),
    deleteMovie: build.mutation<void, string>({
      query: (id) => ({ url: `/movies/${id}`, method: "DELETE" }),
      invalidatesTags: ["Movies"],
    }),
  }),
});

export const {
  useGetMoviesQuery,
  useGetMovieByIdQuery,
  useCreateMovieMutation,
  useUpdateMovieMutation,
  useDeleteMovieMutation,
} = moviesApi;
