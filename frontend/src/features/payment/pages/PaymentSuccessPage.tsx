import { Link } from "@tanstack/react-router";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/Button";
import { formatCurrency } from "@/utils/format";

interface PaymentSuccessPageProps {
  orderId: string;
  paymentId: string;
  amount: number;
}

export function PaymentSuccessPage({ orderId, paymentId, amount }: PaymentSuccessPageProps) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="flex flex-col items-center text-center rounded-3xl bg-card p-8 shadow-card border border-border/50 backdrop-blur-md">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6 animate-bounce">
          <CheckCircle2 className="size-10" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Your payment was processed successfully. We've received your order and the kitchen is getting started.
        </p>

        <div className="w-full space-y-3 rounded-2xl bg-secondary/50 p-5 mb-8 text-left text-sm border border-border/20">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order ID</span>
            <span className="font-medium text-foreground">{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment ID</span>
            <span className="font-mono text-foreground">{paymentId}</span>
          </div>
          <div className="flex justify-between border-t border-border/50 pt-3">
            <span className="text-muted-foreground font-semibold">Amount Paid</span>
            <span className="font-bold text-primary">{formatCurrency(amount)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Button asChild variant="hero" block size="lg">
            <Link to="/orders">
              Track Order <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>

          <Button asChild variant="outline" block size="lg">
            <Link to="/">
              <ShoppingBag className="mr-2 size-4" /> Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
