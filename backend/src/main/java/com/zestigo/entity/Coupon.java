package com.zestigo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

@Entity
@Table(name = "coupons")
public class Coupon {

    @Id
    @NotBlank
    @Size(max = 20)
    @Column(length = 20)
    private String code;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false, length = 255)
    private String description;

    @NotBlank
    @Pattern(regexp = "^(percent|flat)$", message = "Type must be either 'percent' or 'flat'")
    @Column(nullable = false, length = 10)
    private String type; // 'percent' or 'flat'

    @NotNull
    @Positive
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal value;

    @NotNull
    @Min(0)
    @Column(name = "min_order", nullable = false, precision = 10, scale = 2)
    private BigDecimal minOrder;

    @NotNull
    private Boolean active;

    public Coupon() {
    }

    public Coupon(String code, String description, String type, BigDecimal value, BigDecimal minOrder, Boolean active) {
        this.code = code;
        this.description = description;
        this.type = type;
        this.value = value;
        this.minOrder = minOrder;
        this.active = active;
    }

    @PrePersist
    protected void onCreate() {
        if (this.active == null) {
            this.active = true;
        }
    }

    // Getters and Setters
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public BigDecimal getValue() { return value; }
    public void setValue(BigDecimal value) { this.value = value; }

    public BigDecimal getMinOrder() { return minOrder; }
    public void setMinOrder(BigDecimal minOrder) { this.minOrder = minOrder; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    // Builder
    public static CouponBuilder builder() {
        return new CouponBuilder();
    }

    public static class CouponBuilder {
        private String code;
        private String description;
        private String type;
        private BigDecimal value;
        private BigDecimal minOrder;
        private Boolean active = true;

        public CouponBuilder code(String code) { this.code = code; return this; }
        public CouponBuilder description(String description) { this.description = description; return this; }
        public CouponBuilder type(String type) { this.type = type; return this; }
        public CouponBuilder value(BigDecimal value) { this.value = value; return this; }
        public CouponBuilder minOrder(BigDecimal minOrder) { this.minOrder = minOrder; return this; }
        public CouponBuilder active(Boolean active) { this.active = active; return this; }

        public Coupon build() {
            return new Coupon(code, description, type, value, minOrder, active);
        }
    }
}
