"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleUserBlock(userId: string, blocked: boolean) {
  await requireAdmin();

  await prisma.user.update({
    where: { id: userId },
    data: { isBlocked: blocked },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUser(userId: string) {
  await requireAdmin();

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");
  return { success: true };
}
