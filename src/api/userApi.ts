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
      // Laravel biasanya: { message: "..." } atau { errors: { field: ["msg"] } }
      if (body?.message) {
        message = body.message;
      } else if (body?.errors) {
        // Ambil pesan error pertama dari validation errors Laravel
        const firstField = Object.values(body.errors)[0];
        if (Array.isArray(firstField) && firstField.length > 0) {
          message = firstField[0] as string;
        }
      }
    } catch {
      // body bukan JSON, pakai pesan HTTP status
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export interface Role {
  id: string;
  name: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  reputation_points: number;
  created_at: string;
  updated_at: string;
  roles: Role[];
}

export interface UpdateProfilePayload {
  username?: string;
  avatar_url?: string | null;
  bio?: string | null;
}

export interface UpdatePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export async function fetchMe(): Promise<{ data: User }> {
  const res = await fetch(`${BASE_URL}/me`, { headers: authHeaders() });
  return handleResponse<{ data: User }>(res);
}

export async function updateProfile(
  payload: UpdateProfilePayload,
): Promise<{ message: string; data: User }> {
  const res = await fetch(`${BASE_URL}/me`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<{ message: string; data: User }>(res);
}

export async function updatePassword(
  payload: UpdatePasswordPayload,
): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/me/password`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<{ message: string }>(res);
}
