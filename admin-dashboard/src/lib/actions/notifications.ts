"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export interface NotificationItem {
  id: string;
  type: "order" | "restaurant" | "user";
  title: string;
  description: string;
  createdAt: string; // ISO string for client serialization
  link: string;
}

export async function getNotifications(): Promise<NotificationItem[]> {
  try {
    await requireAdmin();
  } catch {
    return [];
  }

  // Fetch recent pending or confirmed orders
  const recentOrders = await prisma.order.findMany({
    where: {
      status: {
        in: ["PENDING_PAYMENT", "CONFIRMED"],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  // Fetch recent pending restaurants
  const pendingRestaurants = await prisma.restaurant.findMany({
    where: {
      status: "PENDING",
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const notifications: NotificationItem[] = [];

  for (const order of recentOrders) {
    notifications.push({
      id: `order-${order.id}`,
      type: "order",
      title: "New Order Received",
      description: `Order #${order.id.slice(0, 8)} placed by ${order.user.name} for ₹${Number(order.totalAmount)}`,
      createdAt: order.createdAt ? order.createdAt.toISOString() : new Date().toISOString(),
      link: `/admin/orders/${order.id}`,
    });
  }

  for (const rest of pendingRestaurants) {
    notifications.push({
      id: `restaurant-${rest.id}`,
      type: "restaurant",
      title: "Restaurant Pending Approval",
      description: `"${rest.name}" is requesting approval to join ZestiGo`,
      createdAt: rest.createdAt ? rest.createdAt.toISOString() : new Date().toISOString(),
      link: `/admin/restaurants`,
    });
  }

  // Sort by date desc
  notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Return top 5 recent notifications
  return notifications.slice(0, 5);
}
