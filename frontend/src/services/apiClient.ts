import axios, { type InternalAxiosRequestConfig } from "axios";

/**
 * Central Axios instance for Zestigo.
 * Auth tokens are injected via Clerk's getToken() called from request interceptor.
 * The token getter is set by ClerkTokenInjector component after Clerk loads.
 */
const isServer = typeof window === "undefined";

export const apiClient = axios.create({
  baseURL: isServer
    ? (import.meta.env.VITE_API_URL || "http://localhost:8081")
    : "",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Holds a reference to Clerk's getToken function, set at runtime.
let _getToken: (() => Promise<string | null>) | null = null;

export function setClerkTokenGetter(fn: () => Promise<string | null>) {
  _getToken = fn;
}

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const envLabel = isServer ? "[Server SSR]" : "[Client]";
  console.log(`${envLabel} [apiClient] Requesting: ${config.method?.toUpperCase()} ${config.baseURL || ""}${config.url}`, config.params || "");
  if (_getToken) {
    try {
      console.log(`${envLabel} [apiClient] Fetching Clerk token...`);
      const token = await _getToken();
      console.log(`${envLabel} [apiClient] Clerk token obtained:`, token ? `Yes (length: ${token.length})` : "No (null)");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (err) {
      console.error(`${envLabel} [apiClient] Error getting Clerk token:`, err);
    }
  } else {
    console.log(`${envLabel} [apiClient] No Clerk token getter registered yet.`);
  }
  return config;
}, (error) => {
  const envLabel = isServer ? "[Server SSR]" : "[Client]";
  console.error(`${envLabel} [apiClient] Request error:`, error);
  return Promise.reject(error);
});

apiClient.interceptors.response.use((response) => {
  const envLabel = isServer ? "[Server SSR]" : "[Client]";
  console.log(`${envLabel} [apiClient] Response from ${response.config.url}:`, response.status, JSON.stringify(response.data).substring(0, 150));
  return response;
}, (error) => {
  const envLabel = isServer ? "[Server SSR]" : "[Client]";
  console.error(`${envLabel} [apiClient] Response error from ${error.config?.url || "unknown"}:`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    code: error.code
  });
  return Promise.reject(error);
});

