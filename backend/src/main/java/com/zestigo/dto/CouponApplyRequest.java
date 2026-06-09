package com.zestigo.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class CouponApplyRequest {

    @NotBlank(message = "Coupon code is required")
    private String code;

    @NotNull(message = "Subtotal is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Subtotal must be greater than zero")
    private BigDecimal subtotal;

    public CouponApplyRequest() {
    }

    public CouponApplyRequest(String code, BigDecimal subtotal) {
        this.code = code;
        this.subtotal = subtotal;
    }

    // Getters and Setters
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    // Builder
    public static CouponApplyRequestBuilder builder() {
        return new CouponApplyRequestBuilder();
    }

    public static class CouponApplyRequestBuilder {
        private String code;
        private BigDecimal subtotal;

        public CouponApplyRequestBuilder code(String code) { this.code = code; return this; }
        public CouponApplyRequestBuilder subtotal(BigDecimal subtotal) { this.subtotal = subtotal; return this; }

        public CouponApplyRequest build() {
            return new CouponApplyRequest(code, subtotal);
        }
    }
}
