import { Suspense } from "react";
import { getDashboardStats, getRevenueData, getOrderStatusCounts, getRecentOrders } from "@/lib/queries/dashboard";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { DashboardContent } from "./dashboard-content";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardDataLoader />
    </Suspense>
  );
}

async function DashboardDataLoader() {
  const [stats, revenueData, statusCounts, recentOrders] = await Promise.all([
    getDashboardStats(),
    getRevenueData(30),
    getOrderStatusCounts(),
    getRecentOrders(8),
  ]);

  return (
    <DashboardContent
      stats={stats}
      revenueData={revenueData}
      statusCounts={statusCounts}
      recentOrders={recentOrders}
    />
  );
}
