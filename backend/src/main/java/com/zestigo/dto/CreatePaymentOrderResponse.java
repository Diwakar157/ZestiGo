package com.zestigo.dto;

public class CreatePaymentOrderResponse {
    private String razorpayOrderId;
    private int amount;
    private String currency;
    private String razorpayKeyId;

    public CreatePaymentOrderResponse() {
    }

    public CreatePaymentOrderResponse(String razorpayOrderId, int amount, String currency, String razorpayKeyId) {
        this.razorpayOrderId = razorpayOrderId;
        this.amount = amount;
        this.currency = currency;
        this.razorpayKeyId = razorpayKeyId;
    }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public int getAmount() { return amount; }
    public void setAmount(int amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getRazorpayKeyId() { return razorpayKeyId; }
    public void setRazorpayKeyId(String razorpayKeyId) { this.razorpayKeyId = razorpayKeyId; }
}
