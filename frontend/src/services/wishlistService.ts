import { apiClient } from "./apiClient";

export interface Wishlist {
  restaurants: string[];
  foods: string[];
}

export const wishlistService = {
  async getWishlist(): Promise<Wishlist> {
    const response = await apiClient.get<Wishlist>("/api/wishlist");
    return response.data;
  },

  async toggle(kind: "restaurants" | "foods", id: string): Promise<Wishlist> {
    const response = await apiClient.post<Wishlist>("/api/wishlist/toggle", {
      kind,
      id,
    });
    return response.data;
  },
};
