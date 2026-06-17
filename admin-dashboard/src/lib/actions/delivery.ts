"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleDeliveryAvailability(partnerId: string, isAvailable: boolean) {
  await requireAdmin();

  await prisma.deliveryPartner.update({
    where: { id: partnerId },
    data: { isAvailable },
  });

  revalidatePath("/admin/delivery");
  revalidatePath("/admin/dashboard");
  return { success: true };
}
