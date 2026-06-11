package com.zestigo.dto;

import jakarta.validation.constraints.NotBlank;

public class PaymentFailureRequest {

    @NotBlank(message = "Razorpay Order ID is required")
    private String razorpayOrderId;

    private String errorMessage;

    public PaymentFailureRequest() {
    }

    public PaymentFailureRequest(String razorpayOrderId, String errorMessage) {
        this.razorpayOrderId = razorpayOrderId;
        this.errorMessage = errorMessage;
    }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}
