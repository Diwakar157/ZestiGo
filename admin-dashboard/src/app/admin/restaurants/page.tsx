import { Suspense } from "react";
import { getRestaurants } from "@/lib/queries/restaurants";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { RestaurantsContent } from "./restaurants-content";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}

export default async function RestaurantsPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <Suspense fallback={<TableSkeleton rows={8} />}>
      <RestaurantsDataLoader params={params} />
    </Suspense>
  );
}

async function RestaurantsDataLoader({ params }: { params: { page?: string; search?: string; status?: string } }) {
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const status = (params.status || "ALL") as "ALL" | import("@prisma/client").RestaurantStatus;

  const result = await getRestaurants({ page, pageSize: 10, search, status });

  return <RestaurantsContent result={result} currentPage={page} currentSearch={search} currentStatus={status} />;
}
