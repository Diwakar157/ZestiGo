import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ShoppingCart, Tag } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CartItem } from "@/components/CartItem";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { InputField } from "@/components/InputField";
import { useCart } from "@/context/CartContext";
import { couponService } from "@/services/couponService";
import { formatCurrency } from "@/utils/format";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — Zestigo" }] }),
  component: () => (
    <ProtectedRoute>
      <CartPage />
    </ProtectedRoute>
  ),
});

function CartPage() {
  const { items, subtotal } = useCart();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const deliveryFee = items.length ? 40 : 0;
  const tax = subtotal * 0.05;
  const total = Math.max(0, subtotal + deliveryFee + tax - discount);

  async function applyCoupon() {
    try {
      const { coupon, discount: d } = await couponService.applyCoupon(code, subtotal);
      setDiscount(d);
      toast.success(`${coupon.code} applied!`);
    } catch (e) {
      setDiscount(0);
      toast.error((e as Error).message);
    }
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={<ShoppingCart className="size-7" />}
          title="Your cart is empty"
          description="Add some delicious dishes to get started."
          action={
            <Link to="/restaurants" search={{ search: undefined, category: undefined }}>
              <Button>Browse restaurants</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground">Your cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((i) => (
            <CartItem key={i.food.id} item={i} />
          ))}
        </div>
        <aside className="h-fit rounded-3xl bg-card p-6 shadow-card">
          <h2 className="text-lg font-semibold text-foreground">Order summary</h2>
          <div className="mt-4 flex gap-2">
            <InputField
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Coupon code"
              icon={<Tag className="size-4" />}
            />
            <Button variant="secondary" onClick={applyCoupon}>
              Apply
            </Button>
          </div>
          <dl className="mt-5 space-y-2 text-sm">
            <Row label="Subtotal" value={formatCurrency(subtotal)} />
            <Row label="Delivery fee" value={formatCurrency(deliveryFee)} />
            <Row label="GST (5%)" value={formatCurrency(tax)} />
            {discount > 0 && <Row label="Discount" value={`-${formatCurrency(discount)}`} accent />}
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-lg font-bold text-foreground">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <Button
            block
            size="lg"
            className="mt-5"
            onClick={() =>
              navigate({
                to: "/checkout",
                search: {
                  discount,
                  couponCode: code,
                },
              })
            }
          >
            Proceed to checkout
          </Button>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={accent ? "font-medium text-primary" : "font-medium text-foreground"}>
        {value}
      </dd>
    </div>
  );
}
