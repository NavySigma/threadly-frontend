import { apiFetch } from "./client";

export type {
  Tag,
  Category,
  PostUser,
  Post,
  CreatePostPayload,
  UpdatePostPayload,
  PaginatedPosts,
  PostsParams,
} from "../types/posts";

export const postsApi = {
  getAll: (params?: PostsParams) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.category_id) query.set("category_id", params.category_id);
    if (params?.page) query.set("page", String(params.page));
    return apiFetch<PaginatedPosts>(`/posts${query.toString() ? `?${query}` : ""}`);
  },

  getById: (id: string) =>
    apiFetch<{ data: Post }>(`/posts/${id}`),

  create: (payload: CreatePostPayload) =>
    apiFetch<{ message: string; data: Post }>("/posts", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdatePostPayload) =>
    apiFetch<{ message: string; data: Post }>(`/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/posts/${id}`, { method: "DELETE" }),
};

export const categoriesApi = {
  getAll: () => apiFetch<{ data: Category[] }>("/categories"),
};

export const tagsApi = {
  getAll: (params?: { search?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", String(params.page));
    return apiFetch<{ data: Tag[] }>(`/tags${query.toString() ? `?${query}` : ""}`);
  },
};