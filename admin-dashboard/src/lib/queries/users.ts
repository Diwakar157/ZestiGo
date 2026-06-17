import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";
import type { PaginatedResult, UserWithStats } from "@/types";

interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: Role | "ALL";
}

export async function getUsers({
  page = 1,
  pageSize = 10,
  search = "",
  role = "ALL",
}: GetUsersParams = {}): Promise<PaginatedResult<UserWithStats>> {
  const where: Record<string, unknown> = {};

  if (role && role !== "ALL") {
    where.role = role;
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: data as unknown as UserWithStats[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
