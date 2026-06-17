"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, ChevronLeft, ChevronRight, Eye, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate, truncate } from "@/lib/utils";
import { updateOrderStatus } from "@/lib/actions/orders";
import { toast } from "sonner";
import type { PaginatedResult, OrderWithRelations } from "@/types";
import type { OrderStatus } from "@prisma/client";
import Link from "next/link";

const ORDER_STATUSES: { value: string; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING_PAYMENT", label: "Pending Payment" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PREPARING", label: "Preparing" },
  { value: "PICKED_UP", label: "Picked Up" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

interface Props {
  result: PaginatedResult<OrderWithRelations>;
  currentPage: number;
  currentSearch: string;
  currentStatus: string;
}

export function OrdersContent({ result, currentPage, currentSearch, currentStatus }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch);
  const [isPending, startTransition] = useTransition();

  function updateParams(params: Record<string, string>) {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([k, v]) => {
      if (v && v !== "ALL" && v !== "") sp.set(k, v);
      else sp.delete(k);
    });
    if (params.search !== undefined || params.status !== undefined) sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`);
  }

  async function handleStatusUpdate(orderId: string, status: OrderStatus) {
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, status);
        toast.success("Order status updated");
        router.refresh();
      } catch {
        toast.error("Failed to update order status");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">Manage and track all customer orders</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">All Orders</CardTitle>
              <CardDescription>{result.total} total orders</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search orders…"
                  className="pl-9 w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && updateParams({ search })}
                />
              </div>
              <Select value={currentStatus} onValueChange={(v) => updateParams({ status: v })}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{truncate(order.id, 8)}</TableCell>
                  <TableCell>{order.user.name}</TableCell>
                  <TableCell>{truncate(order.restaurantName, 20)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(order.totalAmount.toString())}</TableCell>
                  <TableCell><StatusBadge status={order.status} /></TableCell>
                  <TableCell>
                    {order.payment ? <StatusBadge status={order.payment.paymentStatus} /> : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                        {ORDER_STATUSES.filter((s) => s.value !== "ALL" && s.value !== order.status).map((s) => (
                          <DropdownMenuItem key={s.value} onClick={() => handleStatusUpdate(order.id, s.value as OrderStatus)} disabled={isPending}>
                            {s.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {result.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {result.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {result.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => updateParams({ page: String(currentPage - 1) })}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= result.totalPages}
                  onClick={() => updateParams({ page: String(currentPage + 1) })}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
