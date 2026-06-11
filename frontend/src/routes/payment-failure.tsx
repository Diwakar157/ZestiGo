import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PaymentFailurePage } from "@/features/payment/pages/PaymentFailurePage";

export const Route = createFileRoute("/payment-failure")({
  validateSearch: (s: Record<string, unknown>) => ({
    orderId: (s.orderId as string) || "",
    amount: Number(s.amount) || 0,
  }),
  head: () => ({ meta: [{ title: "Payment Failed — Zestigo" }] }),
  component: () => {
    const { orderId, amount } = Route.useSearch();
    return (
      <ProtectedRoute>
        <PaymentFailurePage orderId={orderId} amount={amount} />
      </ProtectedRoute>
    );
  },
});
