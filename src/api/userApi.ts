const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(err.message ?? `HTTP ${res.status}`);
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
  payload: UpdateProfilePayload
): Promise<{ message: string; data: User }> {
  const res = await fetch(`${BASE_URL}/me`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<{ message: string; data: User }>(res);
}

export async function updatePassword(
  payload: UpdatePasswordPayload
): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/me/password`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<{ message: string }>(res);
}