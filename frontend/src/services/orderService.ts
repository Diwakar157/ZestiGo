import { apiClient } from "./apiClient";
import type { CartItem, Order, OrderStatus, PaymentMethod } from "@/utils/types";

export interface CreateOrderPayload {
  items: CartItem[];
  total: number;
  address: string;
  restaurantName: string;
  paymentMethod?: string;
}

export const orderService = {
  async getOrders(): Promise<Order[]> {
    const response = await apiClient.get<Order[]>("/api/orders");
    return response.data;
  },

  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const response = await apiClient.post<Order>("/api/orders", payload);
    return response.data;
  },

  statusSteps(): OrderStatus[] {
    return ["placed", "preparing", "on-the-way", "delivered"];
  },

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return [
      { id: "card", label: "Credit / Debit Card" },
      { id: "wallet", label: "Zestigo Wallet" },
      { id: "cod", label: "Cash on Delivery" },
    ];
  },
};
