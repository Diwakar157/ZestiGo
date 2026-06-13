import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  CheckCircle2,
  Package,
  Search,
  ShoppingBag,
  RotateCcw,
  Eye,
  MapPin,
  Clock,
  XCircle,
  ChevronRight,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { orderService } from "@/services/orderService";
import { useMyOrders, useReorder } from "@/hooks/useOrders";
import { classNames, formatCurrency, formatDate } from "@/utils/format";
import type { Order, OrderStatus } from "@/utils/types";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "My Orders — Zestigo" }] }),
  component: () => (
    <ProtectedRoute>
      <Orders />
    </ProtectedRoute>
  ),
});

type FilterTab = "all" | "active" | "delivered" | "cancelled";
type SortMode = "latest" | "oldest";

const filterTabs: { key: FilterTab; label: string; icon: typeof Package }[] = [
  { key: "all", label: "All", icon: ShoppingBag },
  { key: "active", label: "Active", icon: Clock },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
  { key: "cancelled", label: "Cancelled", icon: XCircle },
];

const steps = orderService.statusSteps();

const statusLabels: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pending Payment",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  PICKED_UP: "Picked Up",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const statusColors: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "text-amber-500 bg-amber-500/10",
  CONFIRMED: "text-blue-500 bg-blue-500/10",
  PREPARING: "text-orange-500 bg-orange-500/10",
  PICKED_UP: "text-indigo-500 bg-indigo-500/10",
  OUT_FOR_DELIVERY: "text-violet-500 bg-violet-500/10",
  DELIVERED: "text-primary bg-primary/10",
  CANCELLED: "text-destructive bg-destructive/10",
};

function Orders() {
  const { data: orders, isLoading, error } = useMyOrders();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("latest");

  const filtered = useMemo(() => {
    if (!orders) return [];
    let list = [...orders];

    // Apply filter
    if (filter === "active") {
      list = list.filter(
        (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED"
      );
    } else if (filter === "delivered") {
      list = list.filter((o) => o.status === "DELIVERED");
    } else if (filter === "cancelled") {
      list = list.filter((o) => o.status === "CANCELLED");
    }

    // Apply search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.restaurantName.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q)
      );
    }

    // Apply sort
    list.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sort === "latest" ? db - da : da - db;
    });

    return list;
  }, [orders, filter, search, sort]);

  const counts = useMemo(() => {
    if (!orders) return { all: 0, active: 0, delivered: 0, cancelled: 0 };
    return {
      all: orders.length,
      active: orders.filter(
        (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED"
      ).length,
      delivered: orders.filter((o) => o.status === "DELIVERED").length,
      cancelled: orders.filter((o) => o.status === "CANCELLED").length,
    };
  }, [orders]);

  if (isLoading) return <LoadingSpinner label="Loading your orders..." />;

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={<XCircle className="size-7" />}
          title="Failed to load orders"
          description="Something went wrong. Please try again later."
          action={
            <Button onClick={() => window.location.reload()}>Retry</Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {orders?.length
              ? `${orders.length} order${orders.length > 1 ? "s" : ""} placed`
              : "Your order history will appear here"}
          </p>
        </div>
        <Link to="/restaurants" search={{ search: undefined, category: undefined }}>
          <Button variant="outline" size="sm">
            <ShoppingBag className="size-4" /> Order More
          </Button>
        </Link>
      </div>

      {!orders?.length ? (
        <div className="mt-10">
          <EmptyState
            icon={<Package className="size-7" />}
            title="No orders yet"
            description="When you place your first order, it will show up here."
            action={
              <Link to="/restaurants" search={{ search: undefined, category: undefined }}>
                <Button>Start Ordering</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <>
          {/* Filter Tabs */}
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              const count = counts[tab.key];
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={classNames(
                    "inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-medium transition-all",
                    filter === tab.key
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={classNames(
                        "ml-0.5 rounded-full px-1.5 py-0.5 text-xs font-bold",
                        filter === tab.key
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-border/50 text-muted-foreground"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search + Sort Bar */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by restaurant name or Order ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <button
              onClick={() =>
                setSort((s) => (s === "latest" ? "oldest" : "latest"))
              }
              className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-all whitespace-nowrap"
            >
              <ArrowUpDown className="size-4 text-muted-foreground" />
              {sort === "latest" ? "Latest first" : "Oldest first"}
            </button>
          </div>

          {/* Orders List */}
          <div className="mt-6 space-y-4">
            {filtered.length === 0 ? (
              <EmptyState
                icon={<Filter className="size-7" />}
                title="No matching orders"
                description="Try adjusting your filters or search terms."
              />
            ) : (
              filtered.map((o) => <OrderCard key={o.id} order={o} />)
            )}
          </div>
        </>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const navigate = useNavigate();
  const reorder = useReorder();
  const isActive =
    order.status !== "DELIVERED" && order.status !== "CANCELLED";
  const idx = steps.indexOf(order.status);

  const itemsSummary =
    order.items
      ?.slice(0, 3)
      .map((i) => `${i.quantity}× ${i.food.name}`)
      .join(", ") +
    (order.items && order.items.length > 3
      ? ` +${order.items.length - 3} more`
      : "");

  async function handleReorder() {
    try {
      await reorder.mutateAsync(order.id);
      toast.success("Items added to cart!");
      navigate({ to: "/cart" });
    } catch {
      toast.error("Failed to reorder. Some items may be unavailable.");
    }
  }

  return (
    <div className="group overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all hover:shadow-card hover:border-primary/30">
      {/* Top bar – status indicator */}
      <div
        className={classNames(
          "flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider",
          statusColors[order.status]
        )}
      >
        {order.status === "DELIVERED" ? (
          <CheckCircle2 className="size-3.5" />
        ) : order.status === "CANCELLED" ? (
          <XCircle className="size-3.5" />
        ) : (
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-current" />
          </span>
        )}
        {statusLabels[order.status]}
      </div>

      <div className="p-6 pt-4">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-foreground truncate">
              {order.restaurantName}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
              <span className="font-mono">{order.id}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {formatDate(order.createdAt)}
              </span>
              {order.paymentMethod && (
                <>
                  <span>•</span>
                  <span className="capitalize">{order.paymentMethod}</span>
                </>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xl font-black text-primary">
              {formatCurrency(order.total)}
            </span>
            {order.paymentStatus && (
              <p
                className={classNames(
                  "text-xs font-bold mt-0.5",
                  order.paymentStatus === "SUCCESS"
                    ? "text-primary"
                    : order.paymentStatus === "FAILED"
                      ? "text-destructive"
                      : "text-amber-500"
                )}
              >
                {order.paymentStatus === "SUCCESS"
                  ? "Paid"
                  : order.paymentStatus === "FAILED"
                    ? "Failed"
                    : "Pending"}
              </p>
            )}
          </div>
        </div>

        {/* Items summary */}
        {itemsSummary && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-1">
            {itemsSummary}
          </p>
        )}

        {/* Mini Progress – active orders only */}
        {isActive && idx >= 0 && (
          <div className="mt-5 flex items-center gap-1">
            {steps.map((s, i) => (
              <div key={s} className="flex flex-1 items-center gap-1 last:flex-none">
                <div
                  className={classNames(
                    "size-2.5 rounded-full shrink-0 transition-all",
                    i <= idx ? "bg-primary scale-110" : "bg-border"
                  )}
                />
                {i < steps.length - 1 && (
                  <div
                    className={classNames(
                      "h-0.5 flex-1 rounded-full transition-all",
                      i < idx ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
          <Link
            to="/orders/$orderId"
            params={{ orderId: order.id }}
          >
            <Button variant="outline" size="sm">
              <Eye className="size-3.5" /> View Details
            </Button>
          </Link>

          {isActive && (
            <Link
              to="/track-order/$orderId"
              params={{ orderId: order.id }}
            >
              <Button variant="hero" size="sm">
                <MapPin className="size-3.5" /> Track Order{" "}
                <ChevronRight className="size-3.5" />
              </Button>
            </Link>
          )}

          {!isActive && (
            <Button
              variant="secondary"
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
              {reorder.isPending ? "Adding..." : "Reorder"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
