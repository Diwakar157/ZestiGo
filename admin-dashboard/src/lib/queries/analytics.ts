import { prisma } from "@/lib/prisma";
import type { AnalyticsDataPoint, MonthlyData } from "@/types";

export async function getDailyOrders(days: number = 30): Promise<AnalyticsDataPoint[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: startDate } },
    select: { createdAt: true },
  });

  const dailyCounts = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    dailyCounts.set(d.toISOString().split("T")[0], 0);
  }

  for (const order of orders) {
    if (order.createdAt) {
      const key = order.createdAt.toISOString().split("T")[0];
      dailyCounts.set(key, (dailyCounts.get(key) ?? 0) + 1);
    }
  }

  return Array.from(dailyCounts.entries()).map(([label, value]) => ({ label, value }));
}

export async function getMonthlySales(months: number = 12): Promise<MonthlyData[]> {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: startDate }, status: { not: "CANCELLED" } },
    select: { createdAt: true, totalAmount: true },
  });

  const monthly = new Map<string, { revenue: number; orders: number }>();
  for (let i = 0; i < months; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - (months - 1 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthly.set(key, { revenue: 0, orders: 0 });
  }

  for (const order of orders) {
    if (order.createdAt) {
      const key = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, "0")}`;
      const current = monthly.get(key) ?? { revenue: 0, orders: 0 };
      monthly.set(key, { revenue: current.revenue + order.totalAmount.toNumber(), orders: current.orders + 1 });
    }
  }

  return Array.from(monthly.entries()).map(([month, data]) => ({
    month,
    revenue: data.revenue,
    orders: data.orders,
  }));
}

export async function getTopRestaurants(limit: number = 5): Promise<AnalyticsDataPoint[]> {
  const restaurants = await prisma.restaurant.findMany({
    take: limit,
    orderBy: { orders: { _count: "desc" } },
    select: { name: true, _count: { select: { orders: true } } },
  });

  return restaurants.map((r) => ({ label: r.name, value: r._count.orders }));
}

export async function getTopFoodItems(limit: number = 5): Promise<AnalyticsDataPoint[]> {
  const items = await prisma.orderItem.groupBy({
    by: ["foodItemId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  const foodItems = await prisma.foodItem.findMany({
    where: { id: { in: items.map((i) => i.foodItemId) } },
    select: { id: true, name: true },
  });

  const nameMap = new Map(foodItems.map((f) => [f.id, f.name]));

  return items.map((i) => ({
    label: nameMap.get(i.foodItemId) ?? "Unknown",
    value: i._sum.quantity ?? 0,
  }));
}

export async function getCustomerGrowth(months: number = 12): Promise<AnalyticsDataPoint[]> {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const users = await prisma.user.findMany({
    where: { createdAt: { gte: startDate }, role: "ROLE_USER" },
    select: { createdAt: true },
  });

  const monthly = new Map<string, number>();
  for (let i = 0; i < months; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - (months - 1 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthly.set(key, 0);
  }

  for (const user of users) {
    if (user.createdAt) {
      const key = `${user.createdAt.getFullYear()}-${String(user.createdAt.getMonth() + 1).padStart(2, "0")}`;
      monthly.set(key, (monthly.get(key) ?? 0) + 1);
    }
  }

  return Array.from(monthly.entries()).map(([label, value]) => ({ label, value }));
}
