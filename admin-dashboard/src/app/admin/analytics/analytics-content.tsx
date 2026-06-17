"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { RevenueDataPoint, AnalyticsDataPoint, MonthlyData } from "@/types";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  revenueData: RevenueDataPoint[];
  dailyOrders: AnalyticsDataPoint[];
  monthlySales: MonthlyData[];
  topRestaurants: AnalyticsDataPoint[];
  topFoodItems: AnalyticsDataPoint[];
  customerGrowth: AnalyticsDataPoint[];
}

export function AnalyticsContent({ revenueData, dailyOrders, monthlySales, topRestaurants, topFoodItems, customerGrowth }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Detailed insights into platform performance</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily Revenue</CardTitle>
            <CardDescription>Last 30 days revenue trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="aRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(142, 10%, 90%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <RechartsTooltip formatter={(value: number) => [formatCurrency(value), "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(142, 71%, 45%)" fill="url(#aRevenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily Orders</CardTitle>
            <CardDescription>Order volume over last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyOrders}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(142, 10%, 90%)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} tickFormatter={(v) => new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <RechartsTooltip />
                  <Bar dataKey="value" name="Orders" fill="hsl(198, 70%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Sales</CardTitle>
            <CardDescription>Revenue and orders by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(142, 10%, 90%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <RechartsTooltip formatter={(value: number, name: string) => [name === "revenue" ? formatCurrency(value) : value, name === "revenue" ? "Revenue" : "Orders"]} />
                  <Bar dataKey="revenue" name="revenue" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Customer Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer Growth</CardTitle>
            <CardDescription>New customer signups by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={customerGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(142, 10%, 90%)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="value" name="New Customers" stroke="hsl(280, 65%, 60%)" strokeWidth={2} dot={{ fill: "hsl(280, 65%, 60%)", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Restaurants */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Restaurants</CardTitle>
            <CardDescription>By total order count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topRestaurants} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(142, 10%, 90%)" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 10 }} width={120} />
                  <RechartsTooltip />
                  <Bar dataKey="value" name="Orders" fill="hsl(43, 96%, 56%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Food Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Food Items</CardTitle>
            <CardDescription>Most ordered items by quantity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topFoodItems} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(142, 10%, 90%)" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 10 }} width={120} />
                  <RechartsTooltip />
                  <Bar dataKey="value" name="Quantity Sold" fill="hsl(12, 76%, 61%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
