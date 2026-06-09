import axios, { type InternalAxiosRequestConfig } from "axios";

/**
 * Central Axios instance for Zestigo.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("qb_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
