import { apiClient } from "./apiClient";
import type { Category, Restaurant } from "@/utils/types";

export interface RestaurantQuery {
  search?: string;
  categoryId?: string;
  sort?: "rating" | "delivery";
}

export const restaurantService = {
  async getRestaurants(query: RestaurantQuery = {}): Promise<Restaurant[]> {
    const response = await apiClient.get<Restaurant[]>("/api/restaurants", {
      params: query,
    });
    return response.data;
  },

  async getRestaurantById(id: string): Promise<Restaurant | undefined> {
    const response = await apiClient.get<Restaurant>(`/api/restaurants/${id}`);
    return response.data;
  },

  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>("/api/restaurants/categories");
    return response.data;
  },

  async getPopular(): Promise<Restaurant[]> {
    const response = await apiClient.get<Restaurant[]>("/api/restaurants/featured");
    return response.data;
  },
};
