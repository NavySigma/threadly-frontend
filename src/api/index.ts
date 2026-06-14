import type { Category, PaginatedResponse, Post } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

// ── Base fetch ─────────────────────────────────────────────────────────
export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string } = {},
): Promise<T> {
  const { method = "GET", body, token } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, json?.message ?? "Error", json);
  return json as T;
}

function qs(
  params: Record<string, string | number | undefined | null>,
): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

// ── Post API ───────────────────────────────────────────────────────────
export interface FetchPostsParams extends Record<
  string,
  string | number | undefined | null
> {
  search?: string;
  tag_id?: string;
  page?: number;
}

export async function fetchPosts(
  params: FetchPostsParams = {},
  token?: string,
): Promise<PaginatedResponse<Post>> {
  return apiFetch(`/posts${qs(params)}`, { token });
}

export async function fetchPost(id: string, token?: string): Promise<Post> {
  const res = await apiFetch<{ data: Post }>(`/posts/${id}`, { token });
  return res.data;
}

// ── Category API ───────────────────────────────────────────────────────
export async function fetchCategories(): Promise<Category[]> {
  const res = await apiFetch<{ data: Category[] }>("/categories");
  return res.data;
}

// ── Client-side filter helpers ─────────────────────────────────────────
export function sortPosts(posts: Post[], sort: string): Post[] {
  return [...posts].sort((a, b) => {
    if (sort === "oldest")
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    if (sort === "highest_vote") return b.vote_score - a.vote_score;
    if (sort === "most_viewed") return b.view_count - a.view_count;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // latest
  });
}

export function filterByAnswer(posts: Post[], answer: string): Post[] {
  if (answer === "answered") return posts.filter((p) => p.is_answered);
  if (answer === "unanswered") return posts.filter((p) => !p.is_answered);
  return posts;
}
