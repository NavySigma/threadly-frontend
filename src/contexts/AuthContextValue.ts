import { createContext, useContext } from "react";
import type { User, RegisterPayload, LoginPayload } from "../types";

export interface AuthContextType {
  user: User | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  loading: boolean;
  isLoading: boolean;
  loginWithToken: (token: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
    return ctx;
};