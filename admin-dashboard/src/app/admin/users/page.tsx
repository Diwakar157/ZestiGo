import { Suspense } from "react";
import { getUsers } from "@/lib/queries/users";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { UsersContent } from "./users-content";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ page?: string; search?: string; role?: string }>;
}

export default async function UsersPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <Suspense fallback={<TableSkeleton rows={8} />}>
      <UsersDataLoader params={params} />
    </Suspense>
  );
}

async function UsersDataLoader({ params }: { params: { page?: string; search?: string; role?: string } }) {
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const role = (params.role || "ALL") as "ALL" | import("@prisma/client").Role;

  const result = await getUsers({ page, pageSize: 10, search, role });

  return <UsersContent result={result} currentPage={page} currentSearch={search} currentRole={role} />;
}
