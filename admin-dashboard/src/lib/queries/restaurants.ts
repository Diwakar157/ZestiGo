import { prisma } from "@/lib/prisma";
import type { RestaurantStatus } from "@prisma/client";
import type { PaginatedResult, RestaurantWithStats } from "@/types";
import { serializePrisma } from "@/lib/utils";

interface GetRestaurantsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: RestaurantStatus | "ALL";
}

export async function getRestaurants({
  page = 1,
  pageSize = 10,
  search = "",
  status = "ALL",
}: GetRestaurantsParams = {}): Promise<PaginatedResult<RestaurantWithStats>> {
  const where: Record<string, unknown> = {};

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { cuisine: { contains: search } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { orders: true, foodItems: true } },
      },
    }),
    prisma.restaurant.count({ where }),
  ]);

  return {
    data: serializePrisma(data) as unknown as RestaurantWithStats[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getRestaurantById(id: string) {
  const data = await prisma.restaurant.findUnique({
    where: { id },
    include: {
      foodItems: true,
      _count: { select: { orders: true, foodItems: true } },
    },
  });
  return serializePrisma(data);
}
