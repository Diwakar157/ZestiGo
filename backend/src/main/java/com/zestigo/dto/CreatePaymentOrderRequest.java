package com.zestigo.dto;

import jakarta.validation.constraints.NotBlank;

public class CreatePaymentOrderRequest {

    @NotBlank(message = "Order ID is required")
    private String orderId;

    public CreatePaymentOrderRequest() {
    }

    public CreatePaymentOrderRequest(String orderId) {
        this.orderId = orderId;
    }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
}
