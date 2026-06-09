import { apiClient } from "./apiClient";
import type { Coupon } from "@/utils/types";

export const couponService = {
  async getCoupons(): Promise<Coupon[]> {
    const response = await apiClient.get<Coupon[]>("/api/coupons");
    return response.data;
  },

  async applyCoupon(code: string, subtotal: number): Promise<{ coupon: Coupon; discount: number }> {
    const response = await apiClient.post<{ coupon: Coupon; discount: number }>("/api/coupons/apply", {
      code,
      subtotal,
    });
    return response.data;
  },
};
