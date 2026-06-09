package com.zestigo.repository;

import com.zestigo.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, String> {
    List<Coupon> findByActiveTrue();
    Optional<Coupon> findByCodeIgnoreCaseAndActiveTrue(String code);
}
