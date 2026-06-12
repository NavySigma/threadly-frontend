// src/api/tags.ts

export interface Tag {
  id: number;
  name: string;
  color: string | null;
  description?: string | null;
  posts_count?: number;
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

export interface TagsParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort?: "popular" | "name" | "new";
}

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export async function fetchTags(params: TagsParams = {}): Promise<TagsResponse> {
  const query = new URLSearchParams();
  if (params.page)     query.set("page",     String(params.page));
  if (params.per_page) query.set("per_page", String(params.per_page));
  if (params.search)   query.set("search",   params.search);
  if (params.sort)     query.set("sort",     params.sort);

  const res = await fetch(`${API_BASE}/tags?${query.toString()}`);
  if (!res.ok) throw new Error("Gagal memuat tags");
  return res.json();
}

export async function fetchTag(id: number | string): Promise<Tag> {
  const res = await fetch(`${API_BASE}/tags/${id}`);
  if (!res.ok) throw new Error("Tag tidak ditemukan");
  return res.json();
}