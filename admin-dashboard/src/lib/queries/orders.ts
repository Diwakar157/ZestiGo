import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";
import type { PaginatedResult, OrderWithRelations } from "@/types";
import { serializePrisma } from "@/lib/utils";

interface GetOrdersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: OrderStatus | "ALL";
}

export async function getOrders({
  page = 1,
  pageSize = 10,
  search = "",
  status = "ALL",
}: GetOrdersParams = {}): Promise<PaginatedResult<OrderWithRelations>> {
  const where: Record<string, unknown> = {};

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { id: { contains: search } },
      { user: { name: { contains: search } } },
      { restaurantName: { contains: search } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        restaurant: { select: { id: true, name: true, imageUrl: true } },
        items: {
          include: {
            foodItem: { select: { id: true, name: true, imageUrl: true, price: true } },
          },
        },
        payment: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data: serializePrisma(data) as unknown as OrderWithRelations[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getOrderById(id: string) {
  const data = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true, phone: true } },
      restaurant: { select: { id: true, name: true, imageUrl: true, address: true } },
      items: {
        include: {
          foodItem: { select: { id: true, name: true, imageUrl: true, price: true, category: true } },
        },
      },
      payment: true,
    },
  });
  return serializePrisma(data);
}
