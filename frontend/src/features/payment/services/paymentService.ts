import { apiClient } from "@/services/apiClient";

export interface CreatePaymentOrderResponse {
  razorpayOrderId: string;
  amount: number; // in paise
  currency: string;
  razorpayKeyId: string;
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentFailureRequest {
  razorpayOrderId: string;
  errorMessage: string;
}

export interface PaymentDto {
  id: string;
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED";
  refundStatus: string;
  transactionTime: string;
  createdAt: string;
}

export const paymentService = {
  async createRazorpayOrder(orderId: string): Promise<CreatePaymentOrderResponse> {
    const response = await apiClient.post<CreatePaymentOrderResponse>("/api/payments/create-order", {
      orderId,
    });
    return response.data;
  },

  async verifyPayment(payload: VerifyPaymentRequest): Promise<PaymentDto> {
    const response = await apiClient.post<PaymentDto>("/api/payments/verify", payload);
    return response.data;
  },

  async failPayment(payload: PaymentFailureRequest): Promise<PaymentDto> {
    const response = await apiClient.post<PaymentDto>("/api/payments/failure", payload);
    return response.data;
  },

  async getPaymentHistory(): Promise<PaymentDto[]> {
    const response = await apiClient.get<PaymentDto[]>("/api/payments/history");
    return response.data;
  },
};
