import { prisma } from "@/lib/prisma";
import type { DashboardStats, RevenueDataPoint, OrderStatusCount } from "@/types";

import { serializePrisma } from "@/lib/utils";

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    totalUsers,
    totalRestaurants,
    totalOrders,
    revenueResult,
    pendingOrders,
    deliveredOrders,
    activeDeliveryPartners,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.restaurant.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
    prisma.order.count({ where: { status: { in: ["PENDING_PAYMENT", "CONFIRMED", "PREPARING"] } } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.deliveryPartner.count({ where: { isAvailable: true } }),
  ]);

  return {
    totalUsers,
    totalRestaurants,
    totalOrders,
    totalRevenue: revenueResult._sum.totalAmount?.toNumber() ?? 0,
    pendingOrders,
    deliveredOrders,
    activeDeliveryPartners,
  };
}

export async function getRevenueData(days: number = 30): Promise<RevenueDataPoint[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate },
      status: { not: "CANCELLED" },
    },
    select: { createdAt: true, totalAmount: true },
    orderBy: { createdAt: "asc" },
  });

  const dailyRevenue = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    dailyRevenue.set(d.toISOString().split("T")[0], 0);
  }

  for (const order of orders) {
    if (order.createdAt) {
      const dateKey = order.createdAt.toISOString().split("T")[0];
      dailyRevenue.set(dateKey, (dailyRevenue.get(dateKey) ?? 0) + order.totalAmount.toNumber());
    }
  }

  return Array.from(dailyRevenue.entries()).map(([date, revenue]) => ({ date, revenue }));
}

export async function getOrderStatusCounts(): Promise<OrderStatusCount[]> {
  const counts = await prisma.order.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  return counts.map((c) => ({ status: c.status, count: c._count.status }));
}

export async function getRecentOrders(limit: number = 10) {
  const data = await prisma.order.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
      restaurant: { select: { id: true, name: true, imageUrl: true } },
    },
  });
  return serializePrisma(data);
}
