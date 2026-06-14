// src/api/tags.ts

export interface Tag {
  id: string;
  name: string;
  slug?: string;
  color: string | null;
  description?: string | null;
  posts_count?: number;
  usage_count?: number;
}

export interface TagsResponse {
  data: Tag[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}

import { apiFetch } from "./client";

export interface TagsParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort?: "popular" | "name" | "new";
}

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export async function fetchTags(
  params: TagsParams = {},
): Promise<TagsResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.per_page) query.set("per_page", String(params.per_page));
  if (params.search) query.set("search", params.search);
  if (params.sort) query.set("sort", params.sort);

  return apiFetch<TagsResponse>(`/tags${query.toString() ? `?${query}` : ""}`);
}

export interface TagDetailPost {
  id: string;
  title: string;
  body: string;
  status: string;
  view_count: number;
  vote_score: number;
  is_answered: boolean;
  created_at: string;
  updated_at: string;
  user: { id: string; username: string; avatar_url: string | null };
  category: { id: string; name: string; slug: string };
}

export interface TagDetail extends Tag {
  posts: TagDetailPost[];
}

export async function fetchTag(id: number | string): Promise<TagDetail> {
  const json = await apiFetch<{ data: TagDetail }>(`/tags/${id}`);
  return json.data ?? json;
}

export async function createTag(payload: {
  name: string;
  color?: string | null;
}): Promise<Tag> {
  const json = await apiFetch<{ data: Tag }>("/tags", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function updateTag(
  id: string,
  payload: { name: string; color?: string | null },
): Promise<Tag> {
  const json = await apiFetch<{ data: Tag }>(`/tags/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function deleteTag(id: string): Promise<void> {
  await apiFetch<{ message: string }>(`/tags/${id}`, {
    method: "DELETE",
  });
}
