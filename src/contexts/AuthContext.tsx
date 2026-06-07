import { useState, useEffect, useContext, type ReactNode } from "react";
import type { User } from "../types";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getMe,
} from "../api/auth";
import type { RegisterPayload, LoginPayload } from "../types";
import { AuthContext } from "./AuthContextValue";
import { getToken } from "../api/client";

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

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
        loading,
        isLoading: loading,
      }}
    >
      {loading ? (
        <div style={{ padding: 24, textAlign: "center" }}>Loading...</div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
