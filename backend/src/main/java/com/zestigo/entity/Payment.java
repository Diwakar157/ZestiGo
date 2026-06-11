package com.zestigo.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @NotBlank
    @Size(max = 36)
    private String id;

    @NotNull
    @JsonBackReference("order-payment")
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(name = "razorpay_order_id", length = 100, unique = true)
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id", length = 100, unique = true)
    private String razorpayPaymentId;

    @Column(name = "razorpay_signature", length = 255)
    private String razorpaySignature;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @NotBlank
    @Size(max = 10)
    @Column(nullable = false, length = 10)
    private String currency;

    @NotBlank
    @Column(name = "payment_method", nullable = false, length = 50)
    private String paymentMethod; // e.g. "upi", "card", "netbanking", "wallet", "cod"

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    private PaymentStatus paymentStatus; // PENDING, SUCCESS, FAILED

    @Column(name = "refund_status", length = 50)
    private String refundStatus; // e.g. "NOT_REFUNDED", "PARTIAL", "FULL"

    @Column(name = "transaction_time")
    private LocalDateTime transactionTime;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Payment() {
    }

    public Payment(String id, Order order, String razorpayOrderId, String razorpayPaymentId, String razorpaySignature,
                   BigDecimal amount, String currency, String paymentMethod, PaymentStatus paymentStatus, String refundStatus,
                   LocalDateTime transactionTime, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.order = order;
        this.razorpayOrderId = razorpayOrderId;
        this.razorpayPaymentId = razorpayPaymentId;
        this.razorpaySignature = razorpaySignature;
        this.amount = amount;
        this.currency = currency;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.refundStatus = refundStatus;
        this.transactionTime = transactionTime;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.paymentStatus == null) {
            this.paymentStatus = PaymentStatus.PENDING;
        }
        if (this.currency == null) {
            this.currency = "INR";
        }
        if (this.refundStatus == null) {
            this.refundStatus = "NOT_REFUNDED";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

    public String getRazorpaySignature() { return razorpaySignature; }
    public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getRefundStatus() { return refundStatus; }
    public void setRefundStatus(String refundStatus) { this.refundStatus = refundStatus; }

    public LocalDateTime getTransactionTime() { return transactionTime; }
    public void setTransactionTime(LocalDateTime transactionTime) { this.transactionTime = transactionTime; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder
    public static PaymentBuilder builder() {
        return new PaymentBuilder();
    }

    public static class PaymentBuilder {
        private String id;
        private Order order;
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String razorpaySignature;
        private BigDecimal amount;
        private String currency = "INR";
        private String paymentMethod;
        private PaymentStatus paymentStatus = PaymentStatus.PENDING;
        private String refundStatus = "NOT_REFUNDED";
        private LocalDateTime transactionTime;

        public PaymentBuilder id(String id) { this.id = id; return this; }
        public PaymentBuilder order(Order order) { this.order = order; return this; }
        public PaymentBuilder razorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; return this; }
        public PaymentBuilder razorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; return this; }
        public PaymentBuilder razorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; return this; }
        public PaymentBuilder amount(BigDecimal amount) { this.amount = amount; return this; }
        public PaymentBuilder currency(String currency) { this.currency = currency; return this; }
        public PaymentBuilder paymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; return this; }
        public PaymentBuilder paymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; return this; }
        public PaymentBuilder refundStatus(String refundStatus) { this.refundStatus = refundStatus; return this; }
        public PaymentBuilder transactionTime(LocalDateTime transactionTime) { this.transactionTime = transactionTime; return this; }

        public Payment build() {
            return new Payment(id, order, razorpayOrderId, razorpayPaymentId, razorpaySignature, amount, currency,
                    paymentMethod, paymentStatus, refundStatus, transactionTime, null, null);
        }
    }
}
