import axios, { type InternalAxiosRequestConfig } from "axios";

/**
 * Central Axios instance for Zestigo.
 * Auth tokens are injected via Clerk's getToken() called from request interceptor.
 * The token getter is set by ClerkTokenInjector component after Clerk loads.
 */

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081",
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
    } catch (err) {
      console.error("[apiClient] Error getting auth token:", err);
    }
  }
  return config;
}, (error) => {
  console.error("[apiClient] Request error:", error);
  return Promise.reject(error);
});

apiClient.interceptors.response.use((response) => {
  return response;
}, (error) => {
  console.error("[apiClient] Response error:", {
    url: error.config?.url,
    status: error.response?.status,
    message: error.message,
  });
  return Promise.reject(error);
});


