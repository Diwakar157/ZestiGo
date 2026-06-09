import axios, { type InternalAxiosRequestConfig } from "axios";

/**
 * Central Axios instance for Zestigo.
 * Auth tokens are injected via Clerk's getToken() called from request interceptor.
 * The token getter is set by ClerkTokenInjector component after Clerk loads.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Holds a reference to Clerk's getToken function, set at runtime.
let _getToken: (() => Promise<string | null>) | null = null;

export function setClerkTokenGetter(fn: () => Promise<string | null>) {
  _getToken = fn;
}

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (_getToken) {
    try {
      const token = await _getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // ignore token errors
    }
  }
  return config;
});
