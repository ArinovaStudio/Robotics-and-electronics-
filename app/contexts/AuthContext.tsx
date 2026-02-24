"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authMethod: "jwt" | "nextauth" | null;

  // Actions
  loginWithJWT: (token: string, user: User) => void;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, status } = useSession();
  const [jwtUser, setJwtUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<"jwt" | "nextauth" | null>(null);

  // Load JWT auth from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUserStr = localStorage.getItem("user");

    if (storedToken && storedUserStr) {
      try {
        const storedUser = JSON.parse(storedUserStr);
        setJwtUser(storedUser);
        setToken(storedToken);
        setAuthMethod("jwt");
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Check for NextAuth session
  useEffect(() => {
    if (session?.user && !jwtUser) {
      setAuthMethod("nextauth");
    }
  }, [session, jwtUser]);

  const loginWithJWT = (newToken: string, user: User) => {
    setToken(newToken);
    setJwtUser(user);
    setAuthMethod("jwt");
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("user", JSON.stringify(user));
    document.cookie = `auth_token=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
  };

  const logout = async () => {
    if (authMethod === "jwt") {
      // Clear JWT auth
      setToken(null);
      setJwtUser(null);
      setAuthMethod(null);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      document.cookie = "auth_token=; path=/; max-age=0";
      window.location.href = "/";
    } else if (authMethod === "nextauth") {
      // NextAuth logout
      await nextAuthSignOut({ callbackUrl: "/" });
    }
  };

  const updateUser = (user: User) => {
    if (authMethod === "jwt") {
      setJwtUser(user);
      localStorage.setItem("user", JSON.stringify(user));
    }
  };

  // Determine current user and auth state
  const currentUser =
    authMethod === "jwt"
      ? jwtUser
      : (session?.user as User | undefined) || null;
  const isAuthenticated = !!currentUser;
  const isLoading = status === "loading";

  const value: AuthContextType = {
    user: currentUser,
    token,
    isAuthenticated,
    isLoading,
    authMethod,
    loginWithJWT,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
