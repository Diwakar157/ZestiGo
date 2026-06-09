package com.zestigo.dto;

import java.math.BigDecimal;

public class CouponApplyResponse {
    private CouponDto coupon;
    private BigDecimal discount;

    public CouponApplyResponse() {
    }

    public CouponApplyResponse(CouponDto coupon, BigDecimal discount) {
        this.coupon = coupon;
        this.discount = discount;
    }

    // Getters and Setters
    public CouponDto getCoupon() { return coupon; }
    public void setCoupon(CouponDto coupon) { this.coupon = coupon; }

    public BigDecimal getDiscount() { return discount; }
    public void setDiscount(BigDecimal discount) { this.discount = discount; }

    // Builder
    public static CouponApplyResponseBuilder builder() {
        return new CouponApplyResponseBuilder();
    }

    public static class CouponApplyResponseBuilder {
        private CouponDto coupon;
        private BigDecimal discount;

        public CouponApplyResponseBuilder coupon(CouponDto coupon) { this.coupon = coupon; return this; }
        public CouponApplyResponseBuilder discount(BigDecimal discount) { this.discount = discount; return this; }

        public CouponApplyResponse build() {
            return new CouponApplyResponse(coupon, discount);
        }
    }
}
