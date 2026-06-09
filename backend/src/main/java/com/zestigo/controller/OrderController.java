package com.zestigo.controller;

import com.zestigo.dto.CreateOrderRequest;
import com.zestigo.dto.OrderDto;
import com.zestigo.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<OrderDto>> getOrders(Principal principal) {
        List<OrderDto> list = orderService.getOrders(principal.getName());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<OrderDto> createOrder(Principal principal, @RequestBody CreateOrderRequest request) {
        OrderDto order = orderService.createOrder(principal.getName(), request);
        return ResponseEntity.ok(order);
    }
}
