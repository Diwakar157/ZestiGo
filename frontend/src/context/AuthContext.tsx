import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService, type Credentials, type RegisterPayload } from "@/services/authService";
import type { User } from "@/utils/types";

export class ValidationError extends Error {
  errors?: Record<string, string>;
  constructor(message: string, errors?: Record<string, string>) {
    super(message);
    this.name = "ValidationError";
    this.errors = errors;
  }
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: Credentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  loginWithToken: (user: User, token: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "qb_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      /* ignore */
    }
  }, []);

  function persist(u: User | null, token?: string) {
    setUser(u);
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      if (token) localStorage.setItem("qb_token", token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("qb_token");
    }
  }

  async function login(credentials: Credentials) {
    setLoading(true);
    try {
      const { user: u, token } = await authService.login(credentials);
      persist(u, token);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message ?? "Login failed";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }

  async function register(payload: RegisterPayload) {
    console.log("AuthContext: register method initiated with payload:", payload);
    setLoading(true);
    try {
      const { user: u, token } = await authService.register(payload);
      console.log("AuthContext: registration succeeded. Persisting user:", u);
      persist(u, token);
    } catch (error: unknown) {
      console.error("AuthContext: registration failed with error:", error);
      const axiosError = error as { response?: { data?: { message?: string, errors?: Record<string, string> } } };
      console.error("AuthContext: Axios error response data:", axiosError?.response?.data);
      const message = axiosError?.response?.data?.message ?? "Registration failed";
      throw new ValidationError(message, axiosError?.response?.data?.errors);
    } finally {
      setLoading(false);
    }
  }

  function loginWithToken(u: User, token: string) {
    persist(u, token);
  }

  async function logout() {
    await authService.logout();
    persist(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, loading, login, register, loginWithToken, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
