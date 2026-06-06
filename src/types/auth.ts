export interface RegisterPayload {
  username: string
  email: string
  password: string
  password_confirmation: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface User {
  id: string
  username: string
  email: string
  avatar_url: string | null
  bio: string | null
  reputation_points: number
  created_at: string
  updated_at: string
  roles?: { id: string; name: string }[]
}

export interface AuthResponse {
  message: string
  data: {
    user: User
    token: string
  }
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
