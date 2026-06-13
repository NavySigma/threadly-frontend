import { getToken } from "./client";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
      else if (body?.errors) {
        const first = Object.values(body.errors)[0];
        if (Array.isArray(first) && first.length > 0) message = first[0] as string;
      }
    } catch (_e) {
      // intentionally ignored
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export interface FollowUser {
  id: string;
  username: string;
  avatar_url: string | null;
  reputation_points: number;
}

export interface PublicUser {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  reputation_points: number;
  level: number;
  level_title?: string;
  next_level_points?: number;
  created_at: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
}

export async function fetchPublicProfile(userId: string): Promise<{ data: PublicUser }> {
  const res = await fetch(`${BASE_URL}/users/${userId}`, {
    headers: authHeaders(),
  });
  return handleResponse<{ data: PublicUser }>(res);
}

export async function followUser(userId: string): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/users/${userId}/follow`, {
    method: "POST",
    headers: authHeaders(),
  });
  return handleResponse<{ message: string }>(res);
}

export async function unfollowUser(userId: string): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/users/${userId}/follow`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse<{ message: string }>(res);
}

export async function fetchFollowers(userId: string): Promise<{ data: FollowUser[]; meta: { followers_count: number } }> {
  const res = await fetch(`${BASE_URL}/users/${userId}/followers`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function fetchFollowing(userId: string): Promise<{ data: FollowUser[]; meta: { following_count: number } }> {
  const res = await fetch(`${BASE_URL}/users/${userId}/following`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}