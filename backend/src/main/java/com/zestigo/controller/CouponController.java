package com.zestigo.controller;

import com.zestigo.dto.CouponApplyRequest;
import com.zestigo.dto.CouponApplyResponse;
import com.zestigo.dto.CouponDto;
import com.zestigo.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @GetMapping
    public ResponseEntity<List<CouponDto>> getCoupons() {
        return ResponseEntity.ok(couponService.getActiveCoupons());
    }

    @PostMapping("/apply")
    public ResponseEntity<CouponApplyResponse> applyCoupon(@Valid @RequestBody CouponApplyRequest request) {
        CouponApplyResponse response = couponService.applyCoupon(request);
        return ResponseEntity.ok(response);
    }
}
