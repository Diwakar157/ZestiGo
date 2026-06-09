package com.zestigo.mapper;

import com.zestigo.dto.CouponDto;
import com.zestigo.entity.Coupon;

public class CouponMapper {
    public static CouponDto toDto(Coupon coupon) {
        if (coupon == null) return null;
        return CouponDto.builder()
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .type(coupon.getType())
                .value(coupon.getValue())
                .minOrder(coupon.getMinOrder())
                .build();
    }
}
