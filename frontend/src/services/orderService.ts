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

  async getOrderById(id: string): Promise<Order> {
    const response = await apiClient.get<Order>(`/api/orders/${id}`);
    return response.data;
  },

  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const response = await apiClient.post<Order>("/api/orders", payload);
    return response.data;
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const response = await apiClient.patch<Order>(`/api/orders/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  async reorderOrder(id: string): Promise<CartItem[]> {
    const response = await apiClient.post<CartItem[]>(`/api/orders/${id}/reorder`);
    return response.data;
  },

  statusSteps(): OrderStatus[] {
    return ["CONFIRMED", "PREPARING", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"];
  },

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return [
      { id: "card", label: "Credit / Debit Card" },
      { id: "upi", label: "UPI (Google Pay, PhonePe, Paytm)" },
      { id: "netbanking", label: "Net Banking" },
      { id: "wallet", label: "Zestigo Wallet" },
      { id: "cod", label: "Cash on Delivery" },
    ];
  },
};
