package com.zestigo.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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

    @NotBlank
    @Pattern(regexp = "^(card|wallet|cod)$", message = "Payment method must be 'card', 'wallet', or 'cod'")
    @Column(name = "payment_method", nullable = false, length = 20)
    private String paymentMethod; // 'card', 'wallet', 'cod'

    @NotBlank
    @Pattern(regexp = "^(PENDING|COMPLETED|FAILED)$", message = "Payment status must be 'PENDING', 'COMPLETED', or 'FAILED'")
    @Column(nullable = false, length = 20)
    private String status; // 'PENDING', 'COMPLETED', 'FAILED'

    @Size(max = 100)
    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Payment() {
    }

    public Payment(String id, Order order, String paymentMethod, String status, String transactionId, LocalDateTime createdAt) {
        this.id = id;
        this.order = order;
        this.paymentMethod = paymentMethod;
        this.status = status;
        this.transactionId = transactionId;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "PENDING";
        }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder
    public static PaymentBuilder builder() {
        return new PaymentBuilder();
    }

    public static class PaymentBuilder {
        private String id;
        private Order order;
        private String paymentMethod;
        private String status = "PENDING";
        private String transactionId;

        public PaymentBuilder id(String id) { this.id = id; return this; }
        public PaymentBuilder order(Order order) { this.order = order; return this; }
        public PaymentBuilder paymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; return this; }
        public PaymentBuilder status(String status) { this.status = status; return this; }
        public PaymentBuilder transactionId(String transactionId) { this.transactionId = transactionId; return this; }

        public Payment build() {
            return new Payment(id, order, paymentMethod, status, transactionId, null);
        }
    }
}
