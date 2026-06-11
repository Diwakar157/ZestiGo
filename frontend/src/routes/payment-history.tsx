import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PaymentHistoryPage } from "@/features/payment/pages/PaymentHistoryPage";

export const Route = createFileRoute("/payment-history")({
  head: () => ({ meta: [{ title: "Transaction History — Zestigo" }] }),
  component: () => (
    <ProtectedRoute>
      <PaymentHistoryPage />
    </ProtectedRoute>
  ),
});
