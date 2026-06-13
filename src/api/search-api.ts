import type {
  SearchPost,
  SearchTag,
  SearchUser,
  SearchResults,
  ParsedSearchQuery,
  SearchType,
} from "../types/search";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export function parseSearchQuery(raw: string): ParsedSearchQuery {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(users|tags|posts):\s*(.+)$/i);

  if (match) {
    return {
      type: match[1].toLowerCase() as SearchType,
      query: match[2].trim(),
    };
  }

  return { type: "all", query: trimmed };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Search API error: ${res.statusText}`);
  }
  return res.json();
}

export async function searchPostsApi(
  q: string,
): Promise<{ data: SearchPost[] }> {
  return fetchJson(`${API_BASE}/search/posts?q=${encodeURIComponent(q)}`);
}

export async function searchTagsApi(q: string): Promise<{ data: SearchTag[] }> {
  return fetchJson(`${API_BASE}/search/tags?q=${encodeURIComponent(q)}`);
}

export async function searchUsersApi(
  q: string,
): Promise<{ data: SearchUser[] }> {
  return fetchJson(`${API_BASE}/search/users?q=${encodeURIComponent(q)}`);
}

export async function searchAllApi(q: string): Promise<SearchResults> {
  const [posts, tags, users] = await Promise.all([
    searchPostsApi(q),
    searchTagsApi(q),
    searchUsersApi(q),
  ]);

  return {
    posts: posts.data ?? [],
    tags: tags.data ?? [],
    users: users.data ?? [],
  };
}
