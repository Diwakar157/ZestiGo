package com.zestigo.service;

import com.zestigo.dto.CartItemDto;
import com.zestigo.dto.CreateOrderRequest;
import com.zestigo.dto.OrderDto;
import com.zestigo.entity.*;
import com.zestigo.exception.BadRequestException;
import com.zestigo.exception.ResourceNotFoundException;
import com.zestigo.mapper.OrderMapper;
import com.zestigo.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final FoodItemRepository foodItemRepository;
    private final PaymentRepository paymentRepository;
    private final CartService cartService;

    public OrderService(OrderRepository orderRepository, UserRepository userRepository,
                        FoodItemRepository foodItemRepository, PaymentRepository paymentRepository,
                        CartService cartService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.foodItemRepository = foodItemRepository;
        this.paymentRepository = paymentRepository;
        this.cartService = cartService;
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getOrders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(OrderMapper::toDto)
                .collect(Collectors.toList());
    }

    public OrderDto createOrder(String email, CreateOrderRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Cannot place order with empty cart");
        }

        // Get the first item to lookup restaurant
        CartItemDto firstItem = request.getItems().get(0);
        FoodItem foodItem = foodItemRepository.findById(firstItem.getFood().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found: " + firstItem.getFood().getId()));
        Restaurant restaurant = foodItem.getRestaurant();

        // Generate Order ID in ORD-XXXX format
        String orderId = "ORD-" + (1000 + (int)(Math.random() * 9000));

        Order order = Order.builder()
                .id(orderId)
                .user(user)
                .restaurant(restaurant)
                .restaurantName(restaurant.getName())
                .totalAmount(request.getTotal())
                .status("placed")
                .address(request.getAddress())
                .items(new ArrayList<>())
                .build();

        // Build items
        for (CartItemDto itemDto : request.getItems()) {
            FoodItem fi = foodItemRepository.findById(itemDto.getFood().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Food item not found: " + itemDto.getFood().getId()));

            OrderItem orderItem = OrderItem.builder()
                    .id(UUID.randomUUID().toString())
                    .order(order)
                    .foodItem(fi)
                    .quantity(itemDto.getQuantity())
                    .priceAtPurchase(fi.getPrice())
                    .build();

            order.getItems().add(orderItem);
        }

        Order savedOrder = orderRepository.save(order);

        // Process payment
        String payMethod = request.getPaymentMethod();
        if (payMethod == null) {
            payMethod = "card";
        }
        Payment payment = Payment.builder()
                .id(UUID.randomUUID().toString())
                .order(savedOrder)
                .paymentMethod(payMethod)
                .status("cod".equalsIgnoreCase(payMethod) ? "PENDING" : "COMPLETED")
                .transactionId(UUID.randomUUID().toString())
                .build();

        paymentRepository.save(payment);
        savedOrder.setPayment(payment);

        // Clear cart
        cartService.clearCart(email);

        return OrderMapper.toDto(savedOrder);
    }
}
