import { useState, useEffect, type ReactNode } from "react";
import type { User, RegisterPayload, LoginPayload } from "../types";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getMe,
} from "../api/auth";
import { AuthContext } from "./AuthContextValue";
import { getToken } from "../api/client";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = getToken();
    let cancelled = false;

    (async () => {
      try {
        // kalau tidak ada token, langsung selesai tanpa setState di awal effect
        if (!token) {
          if (!cancelled) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        const u = await getMe();

        if (!cancelled) {
          setUser(u);
        }
      } catch (err) {
        console.warn("getMe failed:", err);

        if (!cancelled) {
          // jangan langsung hapus token biar tidak logout tiba-tiba
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
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
    try {
      await apiLogout();
    } catch (error) {
      console.warn("Logout API failed:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("token");
    }
  };

  const loginWithToken = async (token: string) => {
    localStorage.setItem("token", token);

    try {
      const u = await getMe();
      setUser(u);
    } catch (err) {
      console.warn("loginWithToken getMe failed:", err);
      setUser(null);
      localStorage.removeItem("token");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        loginWithToken,
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