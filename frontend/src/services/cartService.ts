import { apiClient } from "./apiClient";
import type { CartItem } from "@/utils/types";

export const cartService = {
  async getCart(): Promise<CartItem[]> {
    try {
      const response = await apiClient.get<CartItem[]>("/api/cart");
      return response.data;
    } catch {
      return [];
    }
  },

  async addItem(foodItemId: string, quantity = 1): Promise<CartItem[]> {
    const response = await apiClient.post<CartItem[]>("/api/cart/items", {
      foodItemId,
      quantity,
    });
    return response.data;
  },

  async removeItem(foodItemId: string): Promise<CartItem[]> {
    const response = await apiClient.delete<CartItem[]>(`/api/cart/items/${foodItemId}`);
    return response.data;
  },

  async updateQuantity(foodItemId: string, quantity: number): Promise<CartItem[]> {
    const response = await apiClient.put<CartItem[]>(`/api/cart/items/${foodItemId}`, null, {
      params: { quantity },
    });
    return response.data;
  },

  async clearCart(): Promise<void> {
    await apiClient.delete("/api/cart");
  },
};
