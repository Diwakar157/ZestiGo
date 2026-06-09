import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Package } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { orderService } from "@/services/orderService";
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

const steps = orderService.statusSteps();
const labels: Record<OrderStatus, string> = {
  placed: "Placed",
  preparing: "Preparing",
  "on-the-way": "On the way",
  delivered: "Delivered",
};

function Orders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => orderService.getOrders(),
  });
  if (isLoading) return <LoadingSpinner label="Loading orders..." />;

  const current = orders?.filter((o) => o.status !== "delivered") ?? [];
  const history = orders?.filter((o) => o.status === "delivered") ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground">My orders</h1>
      {!orders?.length ? (
        <div className="mt-8">
          <EmptyState
            icon={<Package className="size-7" />}
            title="No orders yet"
            action={
              <Link to="/restaurants">
                <Button>Start ordering</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <h2 className="mt-8 text-lg font-semibold text-foreground">Current orders</h2>
          <div className="mt-4 space-y-5">
            {current.length ? (
              current.map((o) => <OrderCard key={o.id} order={o} active />)
            ) : (
              <p className="text-sm text-muted-foreground">No active orders.</p>
            )}
          </div>
          <h2 className="mt-10 text-lg font-semibold text-foreground">Order history</h2>
          <div className="mt-4 space-y-5">
            {history.length ? (
              history.map((o) => <OrderCard key={o.id} order={o} />)
            ) : (
              <p className="text-sm text-muted-foreground">No past orders.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function OrderCard({ order, active }: { order: Order; active?: boolean }) {
  const idx = steps.indexOf(order.status);
  return (
    <div className="rounded-3xl bg-card p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground">{order.restaurantName}</p>
          <p className="text-xs text-muted-foreground">
            {order.id} • {formatDate(order.createdAt)}
          </p>
        </div>
        <span className="font-bold text-primary">{formatCurrency(order.total)}</span>
      </div>
      {active && (
        <div className="mt-6 flex items-center">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <span
                  className={classNames(
                    "flex size-8 items-center justify-center rounded-full text-xs font-bold",
                    i <= idx
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  {i <= idx ? <CheckCircle2 className="size-4" /> : i + 1}
                </span>
                <span className="mt-1 text-[10px] text-muted-foreground">{labels[s]}</span>
              </div>
              {i < steps.length - 1 && (
                <span
                  className={classNames(
                    "mx-1 h-1 flex-1 rounded-full",
                    i < idx ? "bg-primary" : "bg-secondary",
                  )}
                />
              )}
            </div>
          ))}
        </div>
      )}
      {!active && (
        <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
          <CheckCircle2 className="size-4" /> Delivered
        </p>
      )}
    </div>
  );
}
