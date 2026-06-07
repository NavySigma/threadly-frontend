import { useState, useContext, type ReactNode } from "react";
import type { User } from "../types";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
} from "../api/auth";
import type { RegisterPayload, LoginPayload } from "../types";
import { AuthContext } from "./AuthContextValue";

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading] = useState(false);

  const login = async (payload: LoginPayload) => {
    const u = await apiLogin(payload);
    setUser(u);
  };

  const register = async (payload: RegisterPayload) => {
    const u = await apiRegister(payload);
    setUser(u);
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}