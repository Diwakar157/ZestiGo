"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import type { RestaurantStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateRestaurantStatus(restaurantId: string, status: RestaurantStatus) {
  await requireAdmin();

  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: { status },
  });

  revalidatePath("/admin/restaurants");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function deleteRestaurant(restaurantId: string) {
  await requireAdmin();

  await prisma.restaurant.delete({ where: { id: restaurantId } });

  revalidatePath("/admin/restaurants");
  revalidatePath("/admin/dashboard");
  return { success: true };
}
