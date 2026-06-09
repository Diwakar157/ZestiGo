package com.zestigo.dto;

import java.math.BigDecimal;

public class CouponDto {
    private String code;
    private String description;
    private String type;
    private BigDecimal value;
    private BigDecimal minOrder;

    public CouponDto() {
    }

    public CouponDto(String code, String description, String type, BigDecimal value, BigDecimal minOrder) {
        this.code = code;
        this.description = description;
        this.type = type;
        this.value = value;
        this.minOrder = minOrder;
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

    // Builder
    public static CouponDtoBuilder builder() {
        return new CouponDtoBuilder();
    }

    public static class CouponDtoBuilder {
        private String code;
        private String description;
        private String type;
        private BigDecimal value;
        private BigDecimal minOrder;

        public CouponDtoBuilder code(String code) { this.code = code; return this; }
        public CouponDtoBuilder description(String description) { this.description = description; return this; }
        public CouponDtoBuilder type(String type) { this.type = type; return this; }
        public CouponDtoBuilder value(BigDecimal value) { this.value = value; return this; }
        public CouponDtoBuilder minOrder(BigDecimal minOrder) { this.minOrder = minOrder; return this; }

        public CouponDto build() {
            return new CouponDto(code, description, type, value, minOrder);
        }
    }
}
