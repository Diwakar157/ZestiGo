import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useOrder } from "@/hooks/useOrders";
import { ArrowLeft, CheckCircle2, MapPin, Bike, Store, Phone, HelpCircle } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { orderService } from "@/services/orderService";
import { authService } from "@/services/authService";
import { useMapReady } from "@/features/maps/hooks/useGoogleMaps";
import { classNames, formatCurrency } from "@/utils/format";
import type { OrderStatus } from "@/utils/types";
import L from "leaflet";

export const Route = createFileRoute("/track-order/$orderId")({
  head: () => ({ meta: [{ title: "Track Order — Zestigo" }] }),
  component: () => (
    <ProtectedRoute>
      <TrackOrder />
    </ProtectedRoute>
  ),
});

const steps: OrderStatus[] = ["CONFIRMED", "PREPARING", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"];

const statusDetails: Record<OrderStatus, { title: string; desc: string; eta: string }> = {
  PENDING_PAYMENT: {
    title: "Awaiting Payment",
    desc: "We are waiting for payment verification.",
    eta: "--",
  },
  CONFIRMED: {
    title: "Order Confirmed",
    desc: "Your order is confirmed and sent to the kitchen.",
    eta: "30-35 mins",
  },
  PREPARING: {
    title: "Preparing Food",
    desc: "Our chef is preparing your delicious meal.",
    eta: "20-25 mins",
  },
  PICKED_UP: {
    title: "Food Picked Up",
    desc: "Delivery partner is picking up your package.",
    eta: "15-20 mins",
  },
  OUT_FOR_DELIVERY: {
    title: "Out for Delivery",
    desc: "Delivery partner is on their way to your home.",
    eta: "5-10 mins",
  },
  DELIVERED: {
    title: "Delivered",
    desc: "Enjoy your fresh meal! Rate your experience.",
    eta: "Delivered",
  },
  CANCELLED: {
    title: "Cancelled",
    desc: "This order has been cancelled.",
    eta: "--",
  },
};

function TrackOrder() {
  const { orderId } = Route.useParams();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const restaurantMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);

  // 1. Ensure Leaflet CSS is loaded
  const { isLoaded: isMapReady } = useMapReady();

  // 2. Fetch order details with polling every 5 seconds (only when order is active)
  const { data: order, isLoading } = useOrder(orderId, (query) => {
    const status = query.state.data?.status;
    return status && status !== "DELIVERED" && status !== "CANCELLED" ? 5000 : false;
  });

  // 3. Fetch addresses to match coordinates
  const { data: addresses } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => authService.getAddresses(),
  });

  // 4. Coordinates extraction
  const [coords, setCoords] = useState<{
    user: [number, number];
    restaurant: [number, number];
    driver: [number, number];
  } | null>(null);

  useEffect(() => {
    if (!order) return;

    // Try to find matching user address coords
    const matchedAddr = addresses?.find(
      (a) =>
        a.line === order.address ||
        order.address.includes(a.line) ||
        a.line.includes(order.address)
    );

    const userLat = matchedAddr?.latitude ?? 12.9715987;
    const userLng = matchedAddr?.longitude ?? 77.5945627;

    // Mock restaurant coordinate at a small offset
    const restLat = userLat + 0.006;
    const restLng = userLng - 0.007;

    // Calculate driver coordinates based on status
    let driverLat = restLat;
    let driverLng = restLng;

    if (order.status === "PICKED_UP") {
      driverLat = restLat * 0.7 + userLat * 0.3;
      driverLng = restLng * 0.7 + userLng * 0.3;
    } else if (order.status === "OUT_FOR_DELIVERY") {
      driverLat = restLat * 0.3 + userLat * 0.7;
      driverLng = restLng * 0.3 + userLng * 0.7;
    } else if (order.status === "DELIVERED") {
      driverLat = userLat;
      driverLng = userLng;
    }

    setCoords({
      user: [userLat, userLng],
      restaurant: [restLat, restLng],
      driver: [driverLat, driverLng],
    });
  }, [order, addresses]);

  // 5. Build/update Leaflet Map
  useEffect(() => {
    if (!isMapReady || !coords || !mapRef.current) return;

    // Check if map instance is initialized
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: true,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Icons definitions
    const restaurantIcon = L.divIcon({
      className: "zestigo-restaurant-marker",
      html: `
        <div style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background-color:#2D6A4F;border:2px solid white;box-shadow:0 4px 10px rgba(0,0,0,0.3);color:white;">
          <svg style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"></path>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v-4"></path>
            <path d="M2 7h20"></path>
          </svg>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const userIcon = L.divIcon({
      className: "zestigo-user-marker",
      html: `
        <div style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background-color:#1A5F7A;border:2px solid white;box-shadow:0 4px 10px rgba(0,0,0,0.3);color:white;">
          <svg style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const driverIcon = L.divIcon({
      className: "zestigo-driver-marker",
      html: `
        <div style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background-color:#FF9F1C;border:2px solid white;box-shadow:0 4px 14px rgba(255,159,28,0.5);color:white;animation: pulse 2s infinite;">
          <svg style="width:22px;height:22px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="5" cy="18" r="3"></circle>
            <circle cx="19" cy="18" r="3"></circle>
            <path d="M12 18V8h7v4"></path>
            <path d="m5 18 6-6"></path>
            <path d="m13 6 2 2 4-4"></path>
          </svg>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    // Clean up old markers
    if (restaurantMarkerRef.current) restaurantMarkerRef.current.remove();
    if (userMarkerRef.current) userMarkerRef.current.remove();
    if (driverMarkerRef.current) driverMarkerRef.current.remove();
    if (routeLineRef.current) routeLineRef.current.remove();

    // Create new elements
    restaurantMarkerRef.current = L.marker(coords.restaurant, { icon: restaurantIcon })
      .addTo(map)
      .bindPopup(`<b>${order?.restaurantName || "Restaurant"}</b><br/>Preparing your order`);

    userMarkerRef.current = L.marker(coords.user, { icon: userIcon })
      .addTo(map)
      .bindPopup("<b>Your Delivery Location</b>");

    // Draw route line
    routeLineRef.current = L.polyline([coords.restaurant, coords.user], {
      color: "#2D6A4F",
      weight: 4,
      opacity: 0.8,
      dashArray: "10, 8",
    }).addTo(map);

    // Only draw driver if order is not delivered/cancelled yet
    if (order && order.status !== "DELIVERED" && order.status !== "CANCELLED" && order.status !== "PENDING_PAYMENT") {
      driverMarkerRef.current = L.marker(coords.driver, { icon: driverIcon })
        .addTo(map)
        .bindPopup("<b>Delivery Partner</b><br/>On their way!");
    }

    // Set bounds
    const bounds = L.latLngBounds([coords.restaurant, coords.user]);
    map.fitBounds(bounds, { padding: [50, 50] });

    // Invalidate size helper
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [isMapReady, coords, order]);

  // Clean up map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  if (isLoading) return <LoadingSpinner label="Connecting to tracking server..." />;

  if (!order) {
    return (
      <div className="py-16">
        <EmptyState
          title="Tracking not available"
          description="Could not locate order information. Please verify your order number."
          action={
            <Link to="/orders">
              <Button>Back to Orders</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const activeIdx = steps.indexOf(order.status);
  const currentDetails = statusDetails[order.status] || {
    title: "Locating order...",
    desc: "Fetching latest coordinates.",
    eta: "--",
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to Orders
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
        {/* Left pane: Stepper tracker */}
        <div className="space-y-6">
          {/* Header tracking info */}
          <div className="rounded-3xl bg-card p-6 shadow-card border border-border">
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary animate-pulse">
                  <span className="size-2 rounded-full bg-primary" /> Live Tracking
                </span>
                <h1 className="text-xl font-bold text-foreground mt-2">{currentDetails.title}</h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Estimated Delivery: <span className="font-semibold text-foreground">{currentDetails.eta}</span>
                </p>
              </div>
              <div className="bg-secondary/80 p-3 rounded-2xl border border-border/20 text-center shrink-0">
                <Bike className="size-6 text-primary mx-auto" />
                <span className="text-[10px] text-muted-foreground font-semibold mt-1 block">ZestiGo Flash</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 border-t border-border pt-4 leading-relaxed">
              {currentDetails.desc}
            </p>
          </div>

          {/* Vertical Stepper */}
          <div className="rounded-3xl bg-card p-6 shadow-card border border-border">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6">Delivery Progress</h2>
            <div className="relative pl-8 space-y-8">
              {/* Vertical line connector */}
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-secondary" />
              <div
                className="absolute left-[15px] top-2 w-0.5 bg-primary transition-all duration-500"
                style={{
                  height: `${activeIdx >= 0 ? (activeIdx / (steps.length - 1)) * 90 : 0}%`,
                }}
              />

              {steps.map((s, idx) => {
                const isCompleted = idx < activeIdx;
                const isActive = idx === activeIdx;
                const isPending = idx > activeIdx;
                const details = statusDetails[s];

                return (
                  <div key={s} className="relative flex gap-4">
                    {/* Bullet */}
                    <div
                      className={classNames(
                        "absolute -left-[27px] top-0.5 flex size-7 items-center justify-center rounded-full border-2 transition-all duration-300 z-10",
                        isCompleted
                          ? "bg-primary border-primary text-primary-foreground"
                          : isActive
                          ? "bg-card border-primary text-primary shadow-soft scale-110"
                          : "bg-card border-secondary text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="size-4" />
                      ) : isActive ? (
                        <span className="size-2.5 rounded-full bg-primary animate-ping" />
                      ) : (
                        <span className="size-2 rounded-full bg-muted-foreground/30" />
                      )}
                    </div>

                    <div>
                      <h3
                        className={classNames(
                          "font-bold text-sm transition-colors duration-300",
                          isActive ? "text-foreground" : isCompleted ? "text-muted-foreground font-medium" : "text-muted-foreground/60"
                        )}
                      >
                        {details.title}
                      </h3>
                      <p
                        className={classNames(
                          "text-xs mt-0.5 leading-relaxed",
                          isActive ? "text-muted-foreground" : "text-muted-foreground/50"
                        )}
                      >
                        {details.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Boy Card */}
          {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
            <div className="rounded-3xl bg-gradient-to-br from-emerald-900/10 to-teal-900/10 p-5 shadow-soft border border-emerald-500/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                  <Bike className="size-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">Rahul Kumar</h4>
                  <p className="text-xs text-muted-foreground">Your delivery partner</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href="tel:1234567890"
                  className="size-10 bg-card rounded-xl border border-border flex items-center justify-center text-foreground hover:bg-secondary transition-all"
                  title="Call delivery partner"
                >
                  <Phone className="size-4.5" />
                </a>
                <button
                  className="size-10 bg-card rounded-xl border border-border flex items-center justify-center text-foreground hover:bg-secondary transition-all"
                  title="Help & Support"
                >
                  <HelpCircle className="size-4.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right pane: Interactive Route Map & Order summary */}
        <div className="space-y-6">
          {/* Leaflet Map Card */}
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card h-[400px] lg:h-[480px] relative">
            {!isMapReady && (
              <div className="absolute inset-0 bg-secondary/20 backdrop-blur-sm flex items-center justify-center">
                <LoadingSpinner label="Loading tracking map..." />
              </div>
            )}
            <div ref={mapRef} className="w-full h-full" />
          </div>

          {/* Order Summary details */}
          <div className="rounded-3xl bg-card p-6 shadow-card border border-border">
            <h2 className="text-base font-bold text-foreground mb-4">Order Summary</h2>
            <div className="flex justify-between items-start pb-4 border-b border-border mb-4">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider block">Restaurant</span>
                <span className="font-semibold text-foreground text-sm">{order.restaurantName}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground uppercase tracking-wider block">Total bill</span>
                <span className="font-bold text-primary text-sm">{formatCurrency(order.total)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wider block">Items Ordered</span>
              {order.items?.map((item) => (
                <div key={item.food.id} className="flex justify-between text-sm text-foreground">
                  <span className="text-muted-foreground">
                    {item.quantity} × {item.food.name}
                  </span>
                  <span className="font-medium">{formatCurrency(item.food.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border flex items-start gap-2 text-xs text-muted-foreground">
              <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-foreground block mb-0.5">Delivering to:</span>
                <span>{order.address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
