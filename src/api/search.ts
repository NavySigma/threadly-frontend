// src/api/search.ts
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export interface SearchPost {
  id: number;
  title: string;
  body: string;
  vote_score: number;
  view_count: number;
  is_answered: boolean;
  created_at: string;
  tags: { id: number; name: string; color: string | null }[];
  user: { id: number; username: string; avatar_url: string | null };
}

export interface SearchTag {
  id: number;
  name: string;
  color: string | null;
  description?: string | null;
  posts_count?: number;
  usage_count?: number;
}

export interface SearchUser {
  id: number;
  username: string;
  avatar_url: string | null;
  bio?: string | null;
  posts_count?: number;
}

export interface SearchResults {
  posts: SearchPost[];
  tags: SearchTag[];
  users: SearchUser[];
}

// Parse prefix: "users:code" → { type: "users", query: "code" }
//               "tags:php"   → { type: "tags",  query: "php"  }
//               "code"       → { type: "all",   query: "code" }
export type SearchType = "all" | "posts" | "tags" | "users";

export function parseSearchQuery(raw: string): {
  type: SearchType;
  query: string;
} {
  const match = raw.match(/^(users|tags|posts):(.+)$/i);
  if (match) {
    return {
      type: match[1].toLowerCase() as SearchType,
      query: match[2].trim(),
    };
  }
  return { type: "all", query: raw.trim() };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal melakukan pencarian");
  return res.json();
}

export async function searchPosts(q: string): Promise<{ data: SearchPost[] }> {
  return fetchJson(`${API_BASE}/search/posts?q=${encodeURIComponent(q)}`);
}

export async function searchTags(q: string): Promise<{ data: SearchTag[] }> {
  return fetchJson(`${API_BASE}/search/tags?q=${encodeURIComponent(q)}`);
}

export async function searchUsers(q: string): Promise<{ data: SearchUser[] }> {
  return fetchJson(`${API_BASE}/search/users?q=${encodeURIComponent(q)}`);
}

export async function searchAll(q: string): Promise<SearchResults> {
  const [posts, tags, users] = await Promise.all([
    searchPosts(q),
    searchTags(q),
    searchUsers(q),
  ]);
  return {
    posts: posts.data ?? [],
    tags: tags.data ?? [],
    users: users.data ?? [],
  };
}
