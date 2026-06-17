import { Suspense } from "react";
import { getOrders } from "@/lib/queries/orders";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { OrdersContent } from "./orders-content";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}

export default async function OrdersPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <Suspense fallback={<TableSkeleton rows={8} />}>
      <OrdersDataLoader params={params} />
    </Suspense>
  );
}

async function OrdersDataLoader({ params }: { params: { page?: string; search?: string; status?: string } }) {
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const status = (params.status || "ALL") as "ALL" | import("@prisma/client").OrderStatus;

  const result = await getOrders({ page, pageSize: 10, search, status });

  return <OrdersContent result={result} currentPage={page} currentSearch={search} currentStatus={status} />;
}
