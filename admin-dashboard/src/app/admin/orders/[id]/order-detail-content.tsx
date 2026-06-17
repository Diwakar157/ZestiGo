"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ArrowLeft, MapPin, CreditCard, User, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { updateOrderStatus } from "@/lib/actions/orders";
import { toast } from "sonner";
import type { OrderStatus } from "@prisma/client";

interface Props {
  order: {
    id: string;
    restaurantName: string;
    totalAmount: { toString(): string };
    status: string;
    address: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    user: { id: string; name: string; email: string; avatar: string | null; phone: string | null };
    restaurant: { id: string; name: string; imageUrl: string | null; address: string };
    items: Array<{
      id: string;
      quantity: number;
      priceAtPurchase: { toString(): string };
      foodItem: { id: string; name: string; imageUrl: string | null; price: { toString(): string }; category: string };
    }>;
    payment: {
      paymentMethod: string;
      paymentStatus: string;
      amount: { toString(): string };
      currency: string;
      razorpayPaymentId: string | null;
    } | null;
  };
}

const STATUSES: OrderStatus[] = ["PENDING_PAYMENT", "CONFIRMED", "PREPARING", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export function OrderDetailContent({ order }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleStatusUpdate(status: string) {
    startTransition(async () => {
      try {
        await updateOrderStatus(order.id, status as OrderStatus);
        toast.success(`Order status updated to ${status.replace(/_/g, " ")}`);
        router.refresh();
      } catch {
        toast.error("Failed to update status");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/orders"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order Details</h1>
          <p className="font-mono text-sm text-muted-foreground">{order.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Order info */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Order from {order.restaurantName}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" /> {formatDateTime(order.createdAt)}
              </CardDescription>
            </div>
            <StatusBadge status={order.status} />
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Items */}
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{item.foodItem.name}</p>
                    <p className="text-xs text-muted-foreground">{item.foodItem.category} • Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">{formatCurrency(item.priceAtPurchase.toString())}</p>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex items-center justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount.toString())}</span>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Update Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={order.status} onValueChange={handleStatusUpdate} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4" /> Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{order.user.name}</p>
              <p className="text-muted-foreground">{order.user.email}</p>
              {order.user.phone && <p className="text-muted-foreground">{order.user.phone}</p>}
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><MapPin className="h-4 w-4" /> Delivery Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{order.address}</p>
            </CardContent>
          </Card>

          {/* Payment */}
          {order.payment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><CreditCard className="h-4 w-4" /> Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium">{order.payment.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge status={order.payment.paymentStatus} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">{formatCurrency(order.payment.amount.toString())}</span>
                </div>
                {order.payment.razorpayPaymentId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Txn ID</span>
                    <span className="font-mono text-xs">{order.payment.razorpayPaymentId}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
