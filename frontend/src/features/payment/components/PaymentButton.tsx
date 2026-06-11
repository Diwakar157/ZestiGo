import { useState } from "react";
import { useUser } from "@clerk/tanstack-react-start";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { paymentService, type PaymentDto } from "../services/paymentService";
import { loadRazorpayScript } from "../utils/razorpay";
import { Loader2 } from "lucide-react";

interface PaymentButtonProps {
  orderId: string;
  amount: number; // in Rupees
  onSuccess: (payment: PaymentDto) => void;
  onFailure: (error: any) => void;
  className?: string;
  variant?: "primary" | "hero" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  block?: boolean;
  disabled?: boolean;
}

export function PaymentButton({
  orderId,
  amount,
  onSuccess,
  onFailure,
  className,
  variant = "primary",
  size = "md",
  block = false,
  disabled = false,
}: PaymentButtonProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  async function handlePayment() {
    if (loading) return;
    setLoading(true);

    try {
      // 1. Load Razorpay script dynamically
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load Razorpay SDK. Please check your internet connection.");
        throw new Error("Razorpay SDK load failed");
      }

      // 2. Create Razorpay order on backend
      const rzpOrderResponse = await paymentService.createRazorpayOrder(orderId);
      const { razorpayOrderId, amount: rzpAmount, currency, razorpayKeyId } = rzpOrderResponse;

      // 3. Configure Razorpay checkout options
      const options = {
        key: razorpayKeyId,
        amount: rzpAmount,
        currency: currency,
        name: "Zestigo",
        description: `Order ID: ${orderId}`,
        image: "/favicon.ico", // Or standard logo if available
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            setLoading(true);
            toast.loading("Verifying payment signature...", { id: "verify-payment" });

            const paymentDto = await paymentService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            toast.success("Payment completed successfully! 🎉", { id: "verify-payment" });
            onSuccess(paymentDto);
          } catch (err: any) {
            console.error("Verification error:", err);
            toast.error(err.response?.data?.message || "Payment verification failed.", { id: "verify-payment" });
            onFailure(err);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user?.fullName ?? "",
          email: user?.primaryEmailAddress?.emailAddress ?? "",
          contact: user?.primaryPhoneNumber?.phoneNumber ?? "",
        },
        theme: {
          color: "#2D6A4F", // Zestigo's branding green color
        },
        modal: {
          ondismiss: async () => {
            try {
              setLoading(true);
              await paymentService.failPayment({
                razorpayOrderId,
                errorMessage: "Payment cancelled by user",
              });
            } catch (err) {
              console.error("Error updating failed status:", err);
            } finally {
              setLoading(false);
              toast.error("Payment was cancelled or closed.");
              onFailure(new Error("Payment cancelled by user"));
            }
          },
        },
      };

      // 4. Open Razorpay checkout modal
      const rzp = new (window as any).Razorpay(options);
      
      // Handle optional payments failure directly from Razorpay UI
      rzp.on("payment.failed", async (response: any) => {
        console.error("Payment failed inside SDK:", response.error);
        try {
          await paymentService.failPayment({
            razorpayOrderId,
            errorMessage: response.error.description || "Payment failed",
          });
        } catch (err) {
          console.error("Failed recording payment failure:", err);
        }
      });

      setLoading(false);
      rzp.open();
    } catch (err: any) {
      console.error("Failed to initiate payment:", err);
      setLoading(false);
      onFailure(err);
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      block={block}
      disabled={disabled || loading}
      onClick={handlePayment}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Initiating Payment...
        </>
      ) : (
        `Pay ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount)}`
      )}
    </Button>
  );
}
