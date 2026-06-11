package com.zestigo.controller;

import com.zestigo.dto.*;
import com.zestigo.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<CreatePaymentOrderResponse> createPaymentOrder(
            Principal principal,
            @Valid @RequestBody CreatePaymentOrderRequest request) {
        
        CreatePaymentOrderResponse response = paymentService.createPaymentOrder(principal.getName(), request.getOrderId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<PaymentDto> verifyPayment(
            Principal principal,
            @Valid @RequestBody VerifyPaymentRequest request) {
        
        PaymentDto paymentDto = paymentService.verifyPayment(principal.getName(), request);
        return ResponseEntity.ok(paymentDto);
    }

    @PostMapping("/failure")
    public ResponseEntity<PaymentDto> failPayment(
            Principal principal,
            @Valid @RequestBody PaymentFailureRequest request) {
        
        PaymentDto paymentDto = paymentService.failPayment(principal.getName(), request);
        return ResponseEntity.ok(paymentDto);
    }

    @GetMapping("/history")
    public ResponseEntity<List<PaymentDto>> getPaymentHistory(Principal principal) {
        List<PaymentDto> history = paymentService.getPaymentHistory(principal.getName());
        return ResponseEntity.ok(history);
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(
            @RequestHeader("X-Razorpay-Signature") String signature,
            @RequestBody String payload) {
        
        paymentService.processWebhook(payload, signature);
        return ResponseEntity.ok().build();
    }
}
