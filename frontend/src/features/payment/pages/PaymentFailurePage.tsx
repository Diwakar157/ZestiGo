import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/Button";
import { PaymentButton } from "../components/PaymentButton";
import { toast } from "sonner";

interface PaymentFailurePageProps {
  orderId: string;
  amount: number;
}

export function PaymentFailurePage({ orderId, amount }: PaymentFailurePageProps) {
  const navigate = useNavigate();

  function handleRetrySuccess() {
    toast.success("Retry payment succeeded!");
    navigate({
      to: "/payment-success",
      search: {
        orderId,
        paymentId: "N/A", // or fetch latest payment details if required
        amount,
      },
    });
  }

  function handleRetryFailure(err: any) {
    console.error("Retry payment failed:", err);
    toast.error("Retry payment failed. Please try again.");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="flex flex-col items-center text-center rounded-3xl bg-card p-8 shadow-card border border-border/50 backdrop-blur-md">
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-6 animate-pulse">
          <AlertCircle className="size-10" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Payment Failed</h1>
        <p className="text-muted-foreground text-sm mb-6">
          We couldn't process your payment. This could be due to a network interruption or insufficient funds.
        </p>

        <div className="w-full space-y-3 rounded-2xl bg-secondary/50 p-5 mb-8 text-left text-sm border border-border/20">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order ID</span>
            <span className="font-medium text-foreground">{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-semibold text-destructive">UNPAID</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <PaymentButton
            orderId={orderId}
            amount={amount}
            onSuccess={handleRetrySuccess}
            onFailure={handleRetryFailure}
            variant="primary"
            size="lg"
            block
          />

          <Button asChild variant="outline" block size="lg">
            <Link to="/cart">
              <ArrowLeft className="mr-2 size-4" /> Return to Cart
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
