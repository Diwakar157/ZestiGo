package com.zestigo.controller;

import com.zestigo.dto.CartItemDto;
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

    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderDto>> getMyOrders(Principal principal) {
        return getOrders(principal);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrderById(Principal principal, @PathVariable String id) {
        OrderDto order = orderService.getOrderById(principal.getName(), id);
        return ResponseEntity.ok(order);
    }

    @PostMapping
    public ResponseEntity<OrderDto> createOrder(Principal principal, @RequestBody CreateOrderRequest request) {
        OrderDto order = orderService.createOrder(principal.getName(), request);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{id}/reorder")
    public ResponseEntity<List<CartItemDto>> reorderOrder(Principal principal, @PathVariable String id) {
        List<CartItemDto> cartItems = orderService.reorderOrder(principal.getName(), id);
        return ResponseEntity.ok(cartItems);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable String id,
            @RequestParam com.zestigo.entity.OrderStatus status) {
        OrderDto order = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(order);
    }
}
