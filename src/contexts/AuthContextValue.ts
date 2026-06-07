import { createContext } from "react";
import type { User } from "../types";
import type { RegisterPayload, LoginPayload } from "../types";

export interface AuthContextType {
  user: User | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  loading: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);
