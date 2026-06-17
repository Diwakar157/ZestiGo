import { prisma } from "@/lib/prisma";
import type { PaginatedResult, DeliveryPartnerWithUser } from "@/types";
import { serializePrisma } from "@/lib/utils";

interface GetDeliveryPartnersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  availableOnly?: boolean;
}

export async function getDeliveryPartners({
  page = 1,
  pageSize = 10,
  search = "",
  availableOnly = false,
}: GetDeliveryPartnersParams = {}): Promise<PaginatedResult<DeliveryPartnerWithUser>> {
  const where: Record<string, unknown> = {};

  if (availableOnly) {
    where.isAvailable = true;
  }

  if (search) {
    where.user = {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
      ],
    };
  }

  const [data, total] = await Promise.all([
    prisma.deliveryPartner.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
      },
    }),
    prisma.deliveryPartner.count({ where }),
  ]);

  return {
    data: serializePrisma(data) as unknown as DeliveryPartnerWithUser[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
