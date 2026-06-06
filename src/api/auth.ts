import { apiFetch } from './index'
import type { AuthResponse, RegisterPayload, LoginPayload, User } from '../types/auth'

export async function register(payload: RegisterPayload): Promise<User> {
  const res = await apiFetch<AuthResponse>('/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  setToken(res.data.token)
  return res.data.user
}

export async function login(payload: LoginPayload): Promise<User> {
  const res = await apiFetch<AuthResponse>('/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  setToken(res.data.token)
  return res.data.user
}

export async function logout(): Promise<void> {
  await apiFetch('/logout', { method: 'POST' })
  localStorage.removeItem('token')
}
