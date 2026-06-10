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
    console.log("ADD CLICKED");
    console.log("Food Item ID:", foodItemId);
    try {
      const response = await apiClient.post<CartItem[]>("/api/cart/items", {
        foodItemId,
        quantity,
      });
      console.log("Cart Response:", response);
      return response.data;
    } catch (error: any) {
      console.error("Cart Error:", error);
      console.error("Status:", error.response?.status);
      console.error("Response:", error.response?.data);
      throw error;
    }
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
