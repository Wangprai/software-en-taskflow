"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from "@/constants";
import { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isReady: boolean;
  setSession: (accessToken: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    try {
      const userData = localStorage.getItem(USER_STORAGE_KEY);
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);

      if (userData && token) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsReady(true);
    }
  }, []);

  const setSession = useCallback((accessToken: string, user: User) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);

    setUser(null);

    queryClient.clear();

    router.replace("/login");

    toast.success("Signed out");
  }, [queryClient, router]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isReady,
      setSession,
      logout,
    }),
    [user, isReady, setSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
