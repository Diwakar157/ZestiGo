import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreditCard, Home, Wallet, type LucideIcon } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/Button";
import { useCart } from "@/context/CartContext";
import { authService } from "@/services/authService";
import { orderService } from "@/services/orderService";
import { classNames, formatCurrency } from "@/utils/format";

export const Route = createFileRoute("/checkout")({
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
  wallet: Wallet,
  cod: Home,
};

function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [method, setMethod] = useState("");
  const [placing, setPlacing] = useState(false);

  const { data: addresses } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => authService.getAddresses(),
  });
  const { data: methods } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => orderService.getPaymentMethods(),
  });

  useEffect(() => {
    if (addresses?.length && !address) setAddress(addresses[0].id);
  }, [addresses, address]);
  useEffect(() => {
    if (methods?.length && !method) setMethod(methods[0].id);
  }, [methods, method]);

  const total = subtotal + (items.length ? 40 : 0) + subtotal * 0.05;

  async function placeOrder() {
    setPlacing(true);
    const addr = addresses?.find((a) => a.id === address);
    await orderService.createOrder({
      items,
      total,
      address: addr?.line ?? "",
      restaurantName: items[0]?.food.name ?? "Zestigo",
    });
    clearCart();
    toast.success("Order placed! 🎉");
    navigate({ to: "/orders" });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">Delivery address</h2>
            <div className="space-y-3">
              {addresses?.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAddress(a.id)}
                  className={classNames(
                    "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all",
                    address === a.id ? "border-primary bg-secondary" : "border-border bg-card",
                  )}
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                    <Home className="size-5" />
                  </span>
                  <span>
                    <span className="block font-medium text-foreground">{a.label}</span>
                    <span className="block text-sm text-muted-foreground">{a.line}</span>
                  </span>
                </button>
              ))}
            </div>
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
                      "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all",
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
          <ul className="mt-4 space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.food.id} className="flex justify-between text-muted-foreground">
                <span>
                  {i.quantity}× {i.food.name}
                </span>
                <span className="text-foreground">{formatCurrency(i.food.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-lg font-bold text-foreground">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <Button
            block
            size="lg"
            className="mt-5"
            disabled={!items.length || placing}
            onClick={placeOrder}
          >
            {placing ? "Placing order..." : "Place order"}
          </Button>
        </aside>
      </div>
    </div>
  );
}
