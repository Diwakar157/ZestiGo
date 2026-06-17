import { Suspense } from "react";
import { getDeliveryPartners } from "@/lib/queries/delivery";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { DeliveryContent } from "./delivery-content";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function DeliveryPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <DeliveryDataLoader params={params} />
    </Suspense>
  );
}

async function DeliveryDataLoader({ params }: { params: { page?: string; search?: string } }) {
  const page = Number(params.page) || 1;
  const search = params.search || "";

  const result = await getDeliveryPartners({ page, pageSize: 10, search });

  return <DeliveryContent result={result} currentPage={page} currentSearch={search} />;
}
