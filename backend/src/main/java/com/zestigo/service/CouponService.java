package com.zestigo.service;

import com.zestigo.dto.CouponApplyRequest;
import com.zestigo.dto.CouponApplyResponse;
import com.zestigo.dto.CouponDto;
import com.zestigo.entity.Coupon;
import com.zestigo.exception.BadRequestException;
import com.zestigo.mapper.CouponMapper;
import com.zestigo.repository.CouponRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public List<CouponDto> getActiveCoupons() {
        return couponRepository.findByActiveTrue().stream()
                .map(CouponMapper::toDto)
                .collect(Collectors.toList());
    }

    public CouponApplyResponse applyCoupon(CouponApplyRequest request) {
        Coupon coupon = couponRepository.findByCodeIgnoreCaseAndActiveTrue(request.getCode().trim())
                .orElseThrow(() -> new BadRequestException("Invalid coupon code"));

        if (request.getSubtotal().compareTo(coupon.getMinOrder()) < 0) {
            throw new BadRequestException("Minimum order of ₹" + coupon.getMinOrder() + " required for " + coupon.getCode());
        }

        BigDecimal discount;
        if ("percent".equalsIgnoreCase(coupon.getType())) {
            discount = request.getSubtotal().multiply(coupon.getValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            discount = coupon.getValue();
        }

        return CouponApplyResponse.builder()
                .coupon(CouponMapper.toDto(coupon))
                .discount(discount)
                .build();
    }
}
