const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Only set JSON content type when caller didn't already provide one.
  if (
    options.body &&
    typeof options.body === "string" &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = await res.text();
  }

  if (!res.ok) {
    const error =
      typeof data === "object"
        ? { status: res.status, ...data }
        : { status: res.status, message: String(data) };
    throw error;
  }

  return data as T;
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}
