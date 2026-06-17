import type { Order, OrderItem, Payment, Restaurant, User, DeliveryPartner, FoodItem } from "@prisma/client";

// ─── Dashboard Types ─────────────────────────────────────

export interface DashboardStats {
  totalUsers: number;
  totalRestaurants: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  activeDeliveryPartners: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export interface OrderStatusCount {
  status: string;
  count: number;
}

// ─── Order Types ─────────────────────────────────────────

export type OrderWithRelations = Order & {
  user: Pick<User, "id" | "name" | "email" | "avatar">;
  restaurant: Pick<Restaurant, "id" | "name" | "imageUrl">;
  items: (OrderItem & {
    foodItem: Pick<FoodItem, "id" | "name" | "imageUrl" | "price">;
  })[];
  payment: Payment | null;
};

// ─── Restaurant Types ────────────────────────────────────

export type RestaurantWithStats = Restaurant & {
  _count: {
    orders: number;
    foodItems: number;
  };
};

// ─── User Types ──────────────────────────────────────────

export type UserWithStats = User & {
  _count: {
    orders: number;
  };
};

// ─── Delivery Types ──────────────────────────────────────

export type DeliveryPartnerWithUser = DeliveryPartner & {
  user: Pick<User, "id" | "name" | "email" | "phone" | "avatar">;
};

// ─── Pagination ──────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Analytics Types ─────────────────────────────────────

export interface AnalyticsDataPoint {
  label: string;
  value: number;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
}
