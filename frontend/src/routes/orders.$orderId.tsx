import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useOrder, useReorder } from "@/hooks/useOrders";
import { toast } from "sonner";
import {
  ArrowLeft,
  Clock,
  MapPin,
  CreditCard,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
  Download,
  Package,
  Truck,
  ChefHat,
  HandPlatter,
  XCircle,
  CreditCard as CardIcon,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { classNames, formatCurrency, formatDate } from "@/utils/format";
import type { Order, OrderStatus } from "@/utils/types";

export const Route = createFileRoute("/orders/$orderId")({
  head: () => ({ meta: [{ title: "Order Details — Zestigo" }] }),
  component: () => (
    <ProtectedRoute>
      <OrderDetails />
    </ProtectedRoute>
  ),
});

const statusLabels: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pending Payment",
  CONFIRMED: "Order Confirmed",
  PREPARING: "Preparing Your Food",
  PICKED_UP: "Food Picked Up",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const statusDescriptions: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Awaiting payment confirmation",
  CONFIRMED: "Restaurant has accepted your order",
  PREPARING: "Your food is being prepared with care",
  PICKED_UP: "Delivery partner has picked up your order",
  OUT_FOR_DELIVERY: "Your food is on its way!",
  DELIVERED: "Order delivered successfully",
  CANCELLED: "This order was cancelled",
};

const timelineSteps: { status: OrderStatus; icon: typeof Package }[] = [
  { status: "CONFIRMED", icon: CheckCircle2 },
  { status: "PREPARING", icon: ChefHat },
  { status: "PICKED_UP", icon: HandPlatter },
  { status: "OUT_FOR_DELIVERY", icon: Truck },
  { status: "DELIVERED", icon: Package },
];

function OrderDetails() {
  const { orderId } = Route.useParams();
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrder(orderId);
  const reorder = useReorder();

  if (isLoading) return <LoadingSpinner label="Loading order details..." />;

  if (!order) {
    return (
      <div className="py-16">
        <EmptyState
          title="Order not found"
          description="This order doesn't exist or you don't have access."
          action={
            <Link to="/orders">
              <Button>Back to Orders</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const isOrderActive =
    order.status !== "DELIVERED" && order.status !== "CANCELLED";

  // Determine which timeline step we are at
  const currentIdx = timelineSteps.findIndex((s) => s.status === order.status);

  // Calculate bill breakdown
  const itemsSubtotal = order.items?.reduce(
    (sum, i) => sum + i.food.price * i.quantity,
    0
  ) ?? 0;
  const deliveryFee = 40;
  const gst = itemsSubtotal * 0.05;

  async function handleReorder() {
    try {
      await reorder.mutateAsync(order!.id);
      toast.success("Items added to cart!");
      navigate({ to: "/cart" });
    } catch {
      toast.error("Failed to reorder. Some items may be unavailable.");
    }
  }

  function handleDownloadInvoice() {
    if (!order) return;
    const lines = [
      "═══════════════════════════════════════",
      "           ZESTIGO — INVOICE           ",
      "═══════════════════════════════════════",
      "",
      `Order ID:      ${order.id}`,
      `Date:          ${formatDate(order.createdAt)}`,
      `Restaurant:    ${order.restaurantName}`,
      `Status:        ${statusLabels[order.status]}`,
      `Payment:       ${(order.paymentMethod || "COD").toUpperCase()}`,
      `Payment Status:${order.paymentStatus || "PENDING"}`,
      "",
      "───────────────────────────────────────",
      "  ITEM                    QTY    PRICE",
      "───────────────────────────────────────",
    ];

    order.items?.forEach((item) => {
      const name = item.food.name.padEnd(22).slice(0, 22);
      const qty = String(item.quantity).padStart(3);
      const price = formatCurrency(item.food.price * item.quantity).padStart(10);
      lines.push(`  ${name} ${qty}  ${price}`);
    });

    lines.push(
      "───────────────────────────────────────",
      `  Subtotal                  ${formatCurrency(itemsSubtotal).padStart(10)}`,
      `  Delivery Fee              ${formatCurrency(deliveryFee).padStart(10)}`,
      `  GST (5%)                  ${formatCurrency(gst).padStart(10)}`,
      "═══════════════════════════════════════",
      `  TOTAL                     ${formatCurrency(order.total).padStart(10)}`,
      "═══════════════════════════════════════",
      "",
      `Delivery Address: ${order.address}`,
      "",
      "Thank you for ordering with Zestigo!",
    );

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Zestigo_Invoice_${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Invoice downloaded!");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to Orders
        </Link>
        <div className="flex items-center gap-2">
          {isOrderActive && (
            <Button asChild variant="hero" size="sm">
              <Link to="/track-order/$orderId" params={{ orderId: order.id }}>
                Live Tracking <ChevronRight className="ml-1 size-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
        {/* Banner header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-emerald-500/5 to-teal-500/10 px-6 py-8 border-b border-border sm:px-8">
          <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/5 blur-2xl" />
          <div className="absolute -left-4 -bottom-4 size-24 rounded-full bg-emerald-500/5 blur-xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <span
                className={classNames(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2.5",
                  order.status === "DELIVERED"
                    ? "bg-primary/20 text-primary"
                    : order.status === "CANCELLED"
                      ? "bg-destructive/20 text-destructive"
                      : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                )}
              >
                {order.status === "DELIVERED" ? (
                  <CheckCircle2 className="size-3.5" />
                ) : order.status === "CANCELLED" ? (
                  <XCircle className="size-3.5" />
                ) : (
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-current" />
                  </span>
                )}
                {statusLabels[order.status]}
              </span>
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                {order.restaurantName}
              </h1>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                <Clock className="size-3" />
                Order ID: <span className="font-mono">{order.id}</span> •{" "}
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">
                Total Amount
              </span>
              <span className="text-2xl font-black text-primary">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="divide-y divide-border">
          {/* Status Timeline */}
          {order.status !== "CANCELLED" && (
            <div className="px-6 py-7 sm:px-8">
              <h2 className="text-base font-semibold text-foreground mb-5">
                Order Timeline
              </h2>
              <div className="relative">
                {timelineSteps.map((step, i) => {
                  const Icon = step.icon;
                  const isCompleted = i <= currentIdx;
                  const isCurrent = i === currentIdx;
                  return (
                    <div key={step.status} className="flex gap-4 pb-6 last:pb-0">
                      {/* Vertical line + circle */}
                      <div className="flex flex-col items-center">
                        <div
                          className={classNames(
                            "flex size-10 items-center justify-center rounded-2xl border-2 shrink-0 transition-all",
                            isCompleted
                              ? "border-primary bg-primary text-primary-foreground shadow-soft"
                              : "border-border bg-card text-muted-foreground"
                          )}
                        >
                          <Icon className="size-4.5" />
                        </div>
                        {i < timelineSteps.length - 1 && (
                          <div
                            className={classNames(
                              "w-0.5 flex-1 min-h-6 my-1 rounded-full transition-all",
                              i < currentIdx ? "bg-primary" : "bg-border"
                            )}
                          />
                        )}
                      </div>

                      {/* Text */}
                      <div className="pt-1.5 min-w-0">
                        <p
                          className={classNames(
                            "text-sm font-semibold",
                            isCompleted
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {statusLabels[step.status]}
                          {isCurrent && isOrderActive && (
                            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                              <span className="relative flex size-1.5">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                              </span>
                              Current
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {statusDescriptions[step.status]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cancelled Notice */}
          {order.status === "CANCELLED" && (
            <div className="px-6 py-6 sm:px-8">
              <div className="flex items-center gap-3 rounded-2xl bg-destructive/10 border border-destructive/20 p-4">
                <XCircle className="size-6 text-destructive shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-destructive">
                    Order Cancelled
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    This order was cancelled. If you were charged, a refund will
                    be processed within 5-7 business days.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="px-6 py-6 sm:px-8">
            <h2 className="text-base font-semibold text-foreground mb-4">
              Ordered Items ({order.items?.length ?? 0})
            </h2>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div
                  key={item.food.id}
                  className="flex items-center justify-between rounded-2xl bg-secondary/30 p-3 border border-border/30"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.food.image && (
                      <img
                        src={item.food.image}
                        alt={item.food.name}
                        className="size-14 rounded-xl object-cover border border-border/50 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {item.food.veg !== undefined && (
                          <span
                            className={classNames(
                              "flex size-4 items-center justify-center rounded-sm border",
                              item.food.veg
                                ? "border-green-600"
                                : "border-red-600"
                            )}
                          >
                            <span
                              className={classNames(
                                "size-2 rounded-full",
                                item.food.veg ? "bg-green-600" : "bg-red-600"
                              )}
                            />
                          </span>
                        )}
                        <h3 className="font-medium text-sm text-foreground truncate">
                          {item.food.name}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatCurrency(item.food.price)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-foreground shrink-0 ml-3">
                    {formatCurrency(item.food.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery + Payment Grid */}
          <div className="px-6 py-6 grid gap-5 sm:grid-cols-2 sm:px-8">
            <div>
              <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <MapPin className="size-4.5 text-primary" /> Delivery Address
              </h2>
              <div className="rounded-2xl bg-secondary/50 p-4 border border-border/30 text-sm">
                <p className="text-muted-foreground leading-relaxed">
                  {order.address}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <CardIcon className="size-4.5 text-primary" /> Payment Summary
              </h2>
              <div className="rounded-2xl bg-secondary/50 p-4 border border-border/30 text-sm space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-semibold text-foreground capitalize">
                    {order.paymentMethod || "COD"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span
                    className={classNames(
                      "font-bold",
                      order.paymentStatus === "SUCCESS"
                        ? "text-primary"
                        : order.paymentStatus === "FAILED"
                          ? "text-destructive"
                          : "text-amber-500"
                    )}
                  >
                    {order.paymentStatus === "SUCCESS"
                      ? "✓ Paid"
                      : order.paymentStatus === "FAILED"
                        ? "✗ Failed"
                        : "⏳ Pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bill Details */}
          <div className="px-6 py-6 sm:px-8">
            <h2 className="text-base font-semibold text-foreground mb-3">
              Bill Details
            </h2>
            <div className="space-y-2.5 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-foreground font-medium">
                  {formatCurrency(itemsSubtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="text-foreground font-medium">
                  {formatCurrency(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span className="text-foreground font-medium">
                  {formatCurrency(gst)}
                </span>
              </div>
              <div className="flex justify-between border-t border-border/50 pt-3 text-base font-bold text-foreground">
                <span>Total Bill</span>
                <span className="text-primary">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="px-6 py-5 sm:px-8 bg-secondary/20 flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadInvoice}
            >
              <Download className="size-3.5" /> Download Invoice
            </Button>
            {!isOrderActive && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleReorder}
                disabled={reorder.isPending}
              >
                <RotateCcw
                  className={classNames(
                    "size-3.5",
                    reorder.isPending && "animate-spin"
                  )}
                />
                {reorder.isPending ? "Adding to cart..." : "Reorder"}
              </Button>
            )}
            {isOrderActive && (
              <Button asChild variant="hero" size="sm">
                <Link
                  to="/track-order/$orderId"
                  params={{ orderId: order.id }}
                >
                  <MapPin className="size-3.5" /> Track Order
                  <ChevronRight className="size-3.5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
