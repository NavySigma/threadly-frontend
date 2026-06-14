import type {
  Tag,
  TagDetailResponse,
  TagPostsResponse,
  TagPostsParams,
} from "../types/tagDetail.types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

// ─── Helper ───────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Tag ──────────────────────────────────────────────────────────────────────

/**
 * GET /api/tags/:id
 * Handle both { data: Tag } and bare Tag shapes.
 */
export async function fetchTagById(id: string | number): Promise<Tag> {
  const res = await apiFetch<TagDetailResponse | Tag>(`/tags/${id}`);
  return "data" in res && typeof (res as TagDetailResponse).data === "object"
    ? (res as TagDetailResponse).data
    : (res as Tag);
}

// ─── Posts by tag ─────────────────────────────────────────────────────────────

/**
 * GET /api/posts?tag_id=:id&sort=newest&page=1&per_page=15
 */
export async function fetchPostsByTag(
  params: TagPostsParams
): Promise<TagPostsResponse> {
  const query = new URLSearchParams({
    tag_id:   String(params.tagId),
    sort:     params.sort,
    page:     String(params.page),
    per_page: String(params.per_page ?? 15),
  });
  return apiFetch<TagPostsResponse>(`/posts?${query.toString()}`);
}