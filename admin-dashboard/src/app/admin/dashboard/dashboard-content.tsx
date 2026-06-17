"use client";

import {
  Users,
  Store,
  ShoppingBag,
  IndianRupee,
  Clock,
  CheckCircle2,
  Truck,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { DashboardStats, RevenueDataPoint, OrderStatusCount } from "@/types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const statCards = [
  { key: "totalUsers" as const, label: "Total Users", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "totalRestaurants" as const, label: "Restaurants", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "totalOrders" as const, label: "Total Orders", icon: ShoppingBag, color: "text-violet-600", bg: "bg-violet-50" },
  { key: "totalRevenue" as const, label: "Revenue", icon: IndianRupee, color: "text-amber-600", bg: "bg-amber-50", isCurrency: true },
];

const secondaryStats = [
  { key: "pendingOrders" as const, label: "Pending Orders", icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
  { key: "deliveredOrders" as const, label: "Delivered", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  { key: "activeDeliveryPartners" as const, label: "Active Partners", icon: Truck, color: "text-cyan-600", bg: "bg-cyan-50" },
];

const PIE_COLORS = ["#f59e0b", "#3b82f6", "#6366f1", "#8b5cf6", "#22c55e", "#10b981", "#ef4444"];

interface DashboardContentProps {
  stats: DashboardStats;
  revenueData: RevenueDataPoint[];
  statusCounts: OrderStatusCount[];
  recentOrders: Array<{
    id: string;
    restaurantName: string;
    totalAmount: { toString(): string };
    status: string;
    createdAt: Date | null;
    user: { name: string; avatar: string | null };
  }>;
}

export function DashboardContent({ stats, revenueData, statusCounts, recentOrders }: DashboardContentProps) {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s an overview of your platform.</p>
      </div>

      {/* Primary stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          const value = stats[card.key];
          return (
            <Card key={card.key} className={cn("animate-fade-in", `[animation-delay:${i * 80}ms]`)}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-sm font-medium">{card.label}</CardDescription>
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", card.bg)}>
                  <Icon className={cn("h-5 w-5", card.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {card.isCurrency ? formatCurrency(value) : value.toLocaleString("en-IN")}
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  Updated just now
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Secondary stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {secondaryStats.map((card) => {
          const Icon = card.icon;
          const value = stats[card.key];
          return (
            <Card key={card.key}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", card.bg)}>
                  <Icon className={cn("h-6 w-6", card.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        {/* Revenue chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Revenue Overview</CardTitle>
            <CardDescription>Last 30 days revenue trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(142, 10%, 90%)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <RechartsTooltip
                    formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(142, 71%, 45%)" fill="url(#revGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order status pie chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Order Status Breakdown</CardTitle>
            <CardDescription>Current distribution of all orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusCounts}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="count"
                    nameKey="status"
                    paddingAngle={2}
                  >
                    {statusCounts.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend
                    wrapperStyle={{ fontSize: 11 }}
                    formatter={(value: string) => value.replace(/_/g, " ")}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Orders</CardTitle>
          <CardDescription>Latest orders placed on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Order ID</th>
                  <th className="pb-3 pr-4 font-medium">Customer</th>
                  <th className="pb-3 pr-4 font-medium">Restaurant</th>
                  <th className="pb-3 pr-4 font-medium">Amount</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-3 pr-4 font-mono text-xs">{order.id.slice(0, 8)}…</td>
                    <td className="py-3 pr-4">{order.user.name}</td>
                    <td className="py-3 pr-4">{order.restaurantName}</td>
                    <td className="py-3 pr-4 font-medium">{formatCurrency(order.totalAmount.toString())}</td>
                    <td className="py-3 pr-4"><StatusBadge status={order.status} /></td>
                    <td className="py-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
