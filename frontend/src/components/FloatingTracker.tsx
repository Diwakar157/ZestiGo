import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@clerk/tanstack-react-start";
import { Bike, ChevronRight, X } from "lucide-react";
import { useState, useEffect } from "react";
import { orderService } from "@/services/orderService";
import { classNames } from "@/utils/format";
import type { OrderStatus } from "@/utils/types";

const statusLabels: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Awaiting Payment",
  CONFIRMED: "Confirmed",
  PREPARING: "being Prepared",
  PICKED_UP: "Picked Up",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function FloatingTracker() {
  const { isSignedIn } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // Fetch orders and poll every 10 seconds to detect status changes
  const { data: orders } = useQuery({
    queryKey: ["orders-floating"],
    queryFn: () => orderService.getOrders(),
    refetchInterval: isSignedIn ? 10000 : false,
    enabled: !!isSignedIn,
  });

  // Find the first active order
  const activeOrder = orders?.find(
    (o) =>
      o.status === "CONFIRMED" ||
      o.status === "PREPARING" ||
      o.status === "PICKED_UP" ||
      o.status === "OUT_FOR_DELIVERY"
  );

  // Reset dismissed state if active order changes
  const activeOrderId = activeOrder?.id;
  useEffect(() => {
    if (activeOrderId) {
      setDismissed(false);
    }
  }, [activeOrderId]);

  if (!activeOrder || dismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm sm:w-96 animate-fade-in-up">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card/85 p-4.5 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-primary/40 dark:shadow-black/50">
        {/* Glow accent */}
        <div className="absolute -left-12 -top-12 size-24 rounded-full bg-primary/10 blur-xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary animate-pulse">
              <Bike className="size-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  Active Order
                </span>
              </div>
              <h4 className="font-semibold text-sm text-foreground line-clamp-1 mt-0.5">
                {activeOrder.restaurantName}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your food is {statusLabels[activeOrder.status]}
              </p>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
            title="Dismiss tracker"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-3.5 border-t border-border/50 pt-3 flex items-center justify-end">
          <Link
            to="/track-order/$orderId"
            params={{ orderId: activeOrder.id }}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
          >
            Track Order <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
