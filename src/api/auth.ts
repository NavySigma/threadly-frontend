import { apiFetch, setToken } from "./client";
import type {
  RegisterPayload,
  LoginPayload,
  User,
  LoginResponse,
  RegisterResponse,
} from "../types/auth";

export async function register(payload: RegisterPayload): Promise<User> {
  const useForm = (import.meta.env.VITE_API_URL ?? "").includes(
    "alwaysdata.net",
  );

  if (useForm) {
    const params = new URLSearchParams();
    Object.entries(payload).forEach(([k, v]) => params.append(k, String(v)));
    const res = await apiFetch<RegisterResponse>("/register", {
      method: "POST",
      body: params,
    });

    return res.data;
  }

  const res = await apiFetch<RegisterResponse>("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return res.data;
}

export async function login(payload: LoginPayload): Promise<User> {
  const useForm = (import.meta.env.VITE_API_URL ?? "").includes(
    "alwaysdata.net",
  );

  let res;
  if (useForm) {
    const params = new URLSearchParams();
    Object.entries(payload).forEach(([k, v]) => params.append(k, String(v)));
    res = await apiFetch<LoginResponse>("/login", {
      method: "POST",
      body: params,
    });
  } else {
    res = await apiFetch<LoginResponse>("/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  setToken(res.access_token);
  return res.user;
}

export async function getMe(): Promise<User> {
  const res = await apiFetch<{ data: User }>("/me");
  return res.data;
}

export async function logout(): Promise<void> {
  await apiFetch("/logout", { method: "POST" });
  localStorage.removeItem("token");
}
