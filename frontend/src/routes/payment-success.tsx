import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PaymentSuccessPage } from "@/features/payment/pages/PaymentSuccessPage";

export const Route = createFileRoute("/payment-success")({
  validateSearch: (s: Record<string, unknown>) => ({
    orderId: (s.orderId as string) || "",
    paymentId: (s.paymentId as string) || "",
    amount: Number(s.amount) || 0,
  }),
  head: () => ({ meta: [{ title: "Payment Successful — Zestigo" }] }),
  component: () => {
    const { orderId, paymentId, amount } = Route.useSearch();
    return (
      <ProtectedRoute>
        <PaymentSuccessPage orderId={orderId} paymentId={paymentId} amount={amount} />
      </ProtectedRoute>
    );
  },
});
