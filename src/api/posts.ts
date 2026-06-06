import { apiFetch } from "./client";

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
  usage_count: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  children?: Category[];
}

export interface PostUser {
  id: string;
  username: string;
  avatar_url: string | null;
  reputation_points?: number;
}

export interface Post {
  id: string;
  title: string;
  body: string;
  status: "open" | "closed" | "deleted";
  view_count: number;
  vote_score: number;
  is_answered: boolean;
  accepted_answer_id: string | null;
  created_at: string;
  updated_at: string;
  user: PostUser;
  category: Category;
  tags: Tag[];
}

export interface CreatePostPayload {
  category_id: string;
  title: string;
  body: string;
  tags?: string[];
}

export interface UpdatePostPayload {
  category_id?: string;
  title?: string;
  body?: string;
  tags?: string[];
}

export interface PaginatedPosts {
  data: Post[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PostsParams {
  search?: string;
  category_id?: string;
  page?: number;
}

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