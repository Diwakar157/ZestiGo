import { apiClient } from "./apiClient";
import type { Address, User } from "@/utils/types";

export interface Credentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export const authService = {
  async login(credentials: Credentials): Promise<{ user: User; token: string }> {
    const response = await apiClient.post<{ user: User; token: string }>("/api/auth/login", credentials);
    return response.data;
  },

  async register(payload: RegisterPayload): Promise<{ user: User; token: string }> {
    console.log("authService: sending POST to /api/auth/register with payload:", payload);
    try {
      const response = await apiClient.post<{ user: User; token: string }>("/api/auth/register", payload);
      console.log("authService: register response received successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("authService: error encountered during register request:", error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/api/auth/logout");
    } catch {
      // Ignore if logout request fails (stateless token clearance happens client-side)
    }
  },

  async getAddresses(): Promise<Address[]> {
    const response = await apiClient.get<Address[]>("/api/users/me/addresses");
    return response.data;
  },

  async addAddress(address: { label: string; line: string; isDefault?: boolean }): Promise<Address> {
    const response = await apiClient.post<Address>("/api/users/me/addresses", address);
    return response.data;
  },

  async updateAddress(id: string, address: { label: string; line: string; isDefault?: boolean }): Promise<Address> {
    const response = await apiClient.put<Address>(`/api/users/me/addresses/${id}`, address);
    return response.data;
  },

  async deleteAddress(id: string): Promise<void> {
    await apiClient.delete(`/api/users/me/addresses/${id}`);
  },
};
