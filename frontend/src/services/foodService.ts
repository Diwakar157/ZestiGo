import { apiClient } from "./apiClient";
import type { FoodItem } from "@/utils/types";

export const foodService = {
  async getFoods(): Promise<FoodItem[]> {
    const response = await apiClient.get<FoodItem[]>("/api/foods");
    return response.data;
  },

  async getFoodById(id: string): Promise<FoodItem | undefined> {
    const response = await apiClient.get<FoodItem>(`/api/foods/${id}`);
    return response.data;
  },

  async getFoodsByRestaurant(restaurantId: string): Promise<FoodItem[]> {
    const response = await apiClient.get<FoodItem[]>(`/api/foods/restaurant/${restaurantId}`);
    return response.data;
  },

  async getFeatured(): Promise<FoodItem[]> {
    const response = await apiClient.get<FoodItem[]>("/api/foods/featured");
    return response.data;
  },

  async getRecommended(): Promise<FoodItem[]> {
    const response = await apiClient.get<FoodItem[]>("/api/foods/recommended");
    return response.data;
  },
};
