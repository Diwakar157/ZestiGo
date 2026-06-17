import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { getRevenueData } from "@/lib/queries/dashboard";
import { getDailyOrders, getMonthlySales, getTopRestaurants, getTopFoodItems, getCustomerGrowth } from "@/lib/queries/analytics";
import { AnalyticsContent } from "./analytics-content";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AnalyticsDataLoader />
    </Suspense>
  );
}

async function AnalyticsDataLoader() {
  const [revenueData, dailyOrders, monthlySales, topRestaurants, topFoodItems, customerGrowth] = await Promise.all([
    getRevenueData(30),
    getDailyOrders(30),
    getMonthlySales(12),
    getTopRestaurants(5),
    getTopFoodItems(5),
    getCustomerGrowth(12),
  ]);

  return (
    <AnalyticsContent
      revenueData={revenueData}
      dailyOrders={dailyOrders}
      monthlySales={monthlySales}
      topRestaurants={topRestaurants}
      topFoodItems={topFoodItems}
      customerGrowth={customerGrowth}
    />
  );
}
