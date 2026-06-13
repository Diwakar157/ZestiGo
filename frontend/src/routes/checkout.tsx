import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreditCard, Home, Wallet, type LucideIcon, MapPin, Plus, Smartphone, Landmark } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/Button";
import { useCart } from "@/context/CartContext";
import { authService } from "@/services/authService";
import { orderService } from "@/services/orderService";
import { classNames, formatCurrency } from "@/utils/format";
import { useUser } from "@clerk/tanstack-react-start";
import { loadRazorpayScript } from "@/features/payment/utils/razorpay";
import { paymentService } from "@/features/payment/services/paymentService";
import { InputField } from "@/components/InputField";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MiniMapPreview } from "@/features/maps/components/MiniMapPreview";

export const Route = createFileRoute("/checkout")({
  validateSearch: (s: Record<string, unknown>) => ({
    discount: Number(s.discount) || 0,
    couponCode: (s.couponCode as string) || "",
  }),
  head: () => ({ meta: [{ title: "Checkout — Zestigo" }] }),
  component: () => (
    <ProtectedRoute>
      <Checkout />
    </ProtectedRoute>
  ),
});

// Presentation-only mapping of payment-method id → icon.
const methodIcons: Record<string, LucideIcon> = {
  card: CreditCard,
  upi: Smartphone,
  netbanking: Landmark,
  wallet: Wallet,
  cod: Home,
};

function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { discount, couponCode } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useUser();
  const [address, setAddress] = useState("");
  const [method, setMethod] = useState("");
  const [placing, setPlacing] = useState(false);

  const { data: addresses, refetch } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => authService.getAddresses(),
  });
  const { data: methods } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => orderService.getPaymentMethods(),
  });

  // Handle auto-selecting default or first address
  useEffect(() => {
    if (addresses?.length) {
      const defaultAddress = addresses.find((a) => a.isDefault);
      if (defaultAddress) {
        setAddress(defaultAddress.id);
      } else if (!address || !addresses.some((a) => a.id === address)) {
        setAddress(addresses[0].id);
      }
    }
  }, [addresses, address]);

  useEffect(() => {
    if (methods?.length && !method) setMethod(methods[0].id);
  }, [methods, method]);

  const deliveryFee = items.length ? 40 : 0;
  const tax = subtotal * 0.05;
  const total = Math.max(0, subtotal + deliveryFee + tax - discount);

  async function placeOrder() {
    setPlacing(true);
    let createdOrder: any = null;
    try {
      const addr = addresses?.find((a) => a.id === address);
      if (!addr) {
        toast.error("Please select a delivery address.");
        setPlacing(false);
        return;
      }

      // 1. Create order on backend
      console.log("[Checkout] Step 1: Creating order on backend...");
      createdOrder = await orderService.createOrder({
        items,
        total,
        address: addr.line,
        restaurantName: items[0]?.food.name ?? "Zestigo",
        paymentMethod: method,
      });
      console.log("[Checkout] Step 1 DONE: Order created:", createdOrder);

      // 2. Handle Cash on Delivery (COD)
      if (method === "cod") {
        await clearCart();
        toast.success("Order placed! 🎉");
        navigate({ to: `/track-order/${createdOrder.id}` });
        return;
      }

      // 3. Handle online payment (card/wallet) via Razorpay
      console.log("[Checkout] Step 2: Loading Razorpay script...");
      toast.loading("Initiating payment gateway...", { id: "checkout-payment" });

      const scriptLoaded = await loadRazorpayScript();
      console.log("[Checkout] Step 2 DONE: Razorpay script loaded:", scriptLoaded);
      if (!scriptLoaded) {
        toast.error("Failed to load Razorpay SDK. Please check your internet connection.", { id: "checkout-payment" });
        navigate({ to: "/payment-failure", search: { orderId: createdOrder.id, amount: total } });
        return;
      }

      console.log("[Checkout] Step 3: Calling create-order API for order:", createdOrder.id);
      const rzpOrderResponse = await paymentService.createRazorpayOrder(createdOrder.id);
      console.log("[Checkout] Step 3 DONE: Razorpay order response:", JSON.stringify(rzpOrderResponse));
      const { razorpayOrderId, amount: rzpAmount, currency, razorpayKeyId } = rzpOrderResponse;

      console.log("[Checkout] Step 4: Building Razorpay options...", {
        key: razorpayKeyId,
        amount: rzpAmount,
        currency,
        order_id: razorpayOrderId,
      });

      const options = {
        key: razorpayKeyId,
        amount: rzpAmount,
        currency: currency,
        name: "Zestigo",
        description: `Order ID: ${createdOrder.id}`,
        image: "/favicon.ico",
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            console.log("[Checkout] Payment success callback:", response);
            toast.loading("Verifying payment...", { id: "checkout-payment" });
            await paymentService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            await clearCart();
            toast.success("Order confirmed! 🎉", { id: "checkout-payment" });
            navigate({
              to: `/track-order/${createdOrder.id}`,
            });
          } catch (err: any) {
            console.error("[Checkout] Verification error:", err);
            toast.error("Payment verification failed.", { id: "checkout-payment" });
            navigate({ to: "/payment-failure", search: { orderId: createdOrder.id, amount: total } });
          }
        },
        prefill: {
          name: user?.fullName ?? "",
          email: user?.primaryEmailAddress?.emailAddress ?? "",
          contact: user?.primaryPhoneNumber?.phoneNumber ?? "",
          method: method !== "cod" ? method : undefined,
        },
        theme: {
          color: "#2D6A4F",
        },
        modal: {
          ondismiss: async () => {
            console.log("[Checkout] Razorpay modal dismissed by user");
            try {
              await paymentService.failPayment({
                razorpayOrderId,
                errorMessage: "Payment cancelled by user",
              });
            } catch (err) {
              console.error("[Checkout] Error reporting payment failure:", err);
            } finally {
              toast.error("Payment cancelled.", { id: "checkout-payment" });
              navigate({ to: "/payment-failure", search: { orderId: createdOrder.id, amount: total } });
            }
          },
        },
      };

      console.log("[Checkout] Step 5: Creating Razorpay instance and calling open()...");
      const rzp = new (window as any).Razorpay(options);

      rzp.on("payment.failed", async (response: any) => {
        console.error("[Checkout] Payment failed in SDK:", response.error);
        try {
          await paymentService.failPayment({
            razorpayOrderId,
            errorMessage: response.error.description || "Payment failed",
          });
        } catch (err) {
          console.error("[Checkout] Failed recording payment failure:", err);
        }
      });

      toast.dismiss("checkout-payment");
      rzp.open();
      console.log("[Checkout] Step 5 DONE: rzp.open() called successfully");
    } catch (error: any) {
      console.error("[Checkout] FATAL: Failed to place order:", error);
      console.error("[Checkout] Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      toast.error(error.response?.data?.message || "Failed to place order. Please try again.", { id: "checkout-payment" });
      setPlacing(false);
      if (createdOrder) {
        navigate({ to: "/payment-failure", search: { orderId: createdOrder.id, amount: total } });
      }
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-foreground">Delivery address</h2>
              <button
                onClick={() => navigate({ to: "/profile", search: { addAddress: true, redirectBack: "/checkout" } })}
                className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-all cursor-pointer"
              >
                <Plus className="size-3.5" /> Add New
              </button>
            </div>

            {!addresses || addresses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
                <MapPin className="size-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground mb-3">No delivery addresses found</p>
                <Button size="sm" onClick={() => navigate({ to: "/profile", search: { addAddress: true, redirectBack: "/checkout" } })}>
                  Add Address
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAddress(a.id)}
                    className={classNames(
                      "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all cursor-pointer",
                      address === a.id ? "border-primary bg-secondary" : "border-border bg-card",
                    )}
                  >
                    <MiniMapPreview
                      lat={a.latitude}
                      lng={a.longitude}
                      label={a.label}
                      size="sm"
                      className="shrink-0"
                    />
                    <span>
                      <span className="block font-medium text-foreground">{a.label}</span>
                      <span className="block text-sm text-muted-foreground">{a.line}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">Payment method</h2>
            <div className="space-y-3">
              {methods?.map((m) => {
                const Icon = methodIcons[m.id] ?? CreditCard;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={classNames(
                      "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all cursor-pointer",
                      method === m.id ? "border-primary bg-secondary" : "border-border bg-card",
                    )}
                  >
                    <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-medium text-foreground">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
        <aside className="h-fit rounded-3xl bg-card p-6 shadow-card">
          <h2 className="text-lg font-semibold text-foreground">Order summary</h2>
          <ul className="mt-4 space-y-2 text-sm border-b border-border pb-4">
            {items.map((i) => (
              <li key={i.food.id} className="flex justify-between text-muted-foreground">
                <span>
                  {i.quantity}× {i.food.name}
                </span>
                <span className="text-foreground">{formatCurrency(i.food.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-foreground font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery fee</span>
              <span className="text-foreground font-medium">{formatCurrency(deliveryFee)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%)</span>
              <span className="text-foreground font-medium">{formatCurrency(tax)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-primary font-medium">
                <span>Discount {couponCode ? `(${couponCode})` : ""}</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-lg font-bold text-foreground">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <Button
            block
            size="lg"
            className="mt-5"
            disabled={!items.length || placing || !addresses?.length}
            onClick={placeOrder}
          >
            {placing ? "Placing order..." : !addresses?.length ? "Add address to order" : "Place order"}
          </Button>
        </aside>
      </div>
    </div>
  );
}
