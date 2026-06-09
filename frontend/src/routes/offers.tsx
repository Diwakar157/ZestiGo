import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Ticket } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { couponService } from "@/services/couponService";
import { formatCurrency } from "@/utils/format";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers & Coupons — Zestigo" },
      { name: "description", content: "Save with Zestigo coupons, promotions, and discounts." },
    ],
  }),
  component: Offers,
});

function Offers() {
  const { data: coupons, isLoading } = useQuery({
    queryKey: ["coupons"],
    queryFn: () => couponService.getCoupons(),
  });

  function copy(code: string) {
    navigator.clipboard?.writeText(code);
    toast.success(`${code} copied to clipboard`);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="rounded-4xl bg-gradient-hero p-8 text-primary-foreground shadow-card">
        <h1 className="text-3xl font-bold">Offers & promotions</h1>
        <p className="mt-1 opacity-90">Grab a coupon and save on your next order.</p>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {coupons?.map((c) => (
            <div
              key={c.code}
              className="flex items-center gap-4 rounded-3xl bg-card p-6 shadow-soft"
            >
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
                <Ticket className="size-7" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{c.description}</p>
                <p className="text-xs text-muted-foreground">
                  Min. order {formatCurrency(c.minOrder)}
                </p>
              </div>
              <button
                onClick={() => copy(c.code)}
                className="flex items-center gap-1.5 rounded-2xl border border-dashed border-primary px-3 py-2 text-sm font-bold text-primary transition-colors hover:bg-secondary"
              >
                {c.code} <Copy className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
