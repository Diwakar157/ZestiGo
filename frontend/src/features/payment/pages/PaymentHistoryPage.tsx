import { useQuery } from "@tanstack/react-query";
import { CreditCard, Calendar, Clock, AlertCircle, CheckCircle2, ArrowRightLeft, ShieldAlert } from "lucide-react";
import { paymentService } from "../services/paymentService";
import { formatCurrency } from "@/utils/format";
import { Link } from "@tanstack/react-router";

export function PaymentHistoryPage() {
  const { data: history, isLoading, error } = useQuery({
    queryKey: ["payment-history"],
    queryFn: () => paymentService.getPaymentHistory(),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold text-foreground">Transaction History</h1>
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 w-full animate-pulse rounded-2xl bg-card border border-border/50" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto mb-4">
          <ShieldAlert className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Failed to load history</h2>
        <p className="text-muted-foreground text-sm mt-1">Please try again later or contact support.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Transaction History</h1>
          <p className="text-muted-foreground text-sm mt-1">View and track all your recent payments.</p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
          <ArrowRightLeft className="size-6" />
        </div>
      </div>

      {!history || history.length === 0 ? (
        <div className="rounded-3xl bg-card border border-border/50 p-12 text-center shadow-soft">
          <CreditCard className="size-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No payments found</h3>
          <p className="text-muted-foreground text-sm mt-1">Transactions will appear here once you place and pay for orders.</p>
          <Link to="/" className="mt-5 inline-flex items-center text-sm font-medium text-primary hover:underline">
            Go order some food
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((payment) => {
            const date = new Date(payment.createdAt || payment.transactionTime);
            const formattedDate = date.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const formattedTime = date.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-card border border-border/50 p-6 shadow-soft hover:shadow-card transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex size-12 items-center justify-center rounded-2xl ${
                      payment.paymentStatus === "SUCCESS"
                        ? "bg-primary/10 text-primary"
                        : payment.paymentStatus === "FAILED"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-amber-500/10 text-amber-500"
                    }`}
                  >
                    {payment.paymentStatus === "SUCCESS" ? (
                      <CheckCircle2 className="size-6" />
                    ) : payment.paymentStatus === "FAILED" ? (
                      <AlertCircle className="size-6" />
                    ) : (
                      <Clock className="size-6" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-base">
                        Order ID: {payment.orderId}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          payment.paymentStatus === "SUCCESS"
                            ? "bg-primary/10 text-primary"
                            : payment.paymentStatus === "FAILED"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {payment.paymentStatus}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1 items-center">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3.5" /> {formattedDate}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" /> {formattedTime}
                      </span>
                      {payment.razorpayPaymentId && (
                        <>
                          <span>•</span>
                          <span className="font-mono">Ref: {payment.razorpayPaymentId}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block text-lg font-bold text-foreground">
                    {formatCurrency(payment.amount)}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    via {payment.paymentMethod === "razorpay" ? "Card / Netbanking" : payment.paymentMethod}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
