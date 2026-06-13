package com.zestigo.mapper;

import com.zestigo.dto.PaymentDto;
import com.zestigo.entity.Payment;

public class PaymentMapper {

    public static PaymentDto toDto(Payment payment) {
        if (payment == null) return null;
        return new PaymentDto(
                payment.getId(),
                payment.getOrder().getId(),
                payment.getRazorpayOrderId(),
                payment.getRazorpayPaymentId(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : null,
                payment.getPaymentStatus(),
                payment.getRefundStatus(),
                payment.getTransactionTime(),
                payment.getCreatedAt()
        );
    }
}
