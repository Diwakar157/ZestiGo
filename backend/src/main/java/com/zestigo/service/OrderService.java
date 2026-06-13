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

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final FoodItemRepository foodItemRepository;
    private final CartService cartService;

    private final java.util.concurrent.ScheduledExecutorService scheduler = 
            java.util.concurrent.Executors.newScheduledThreadPool(2);

    public OrderService(OrderRepository orderRepository, UserRepository userRepository,
                        FoodItemRepository foodItemRepository, CartService cartService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.foodItemRepository = foodItemRepository;
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

        String payMethodStr = request.getPaymentMethod();
        if (payMethodStr == null) {
            payMethodStr = "card";
        }

        PaymentMethod paymentMethod;
        try {
            paymentMethod = PaymentMethod.valueOf(payMethodStr.toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            paymentMethod = PaymentMethod.CARD;
        }

        OrderStatus initialStatus = paymentMethod == PaymentMethod.COD ? OrderStatus.CONFIRMED : OrderStatus.PENDING_PAYMENT;

        Order order = Order.builder()
                .id(orderId)
                .user(user)
                .restaurant(restaurant)
                .restaurantName(restaurant.getName())
                .totalAmount(request.getTotal())
                .status(initialStatus)
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

        // Process payment - create Payment entity and attach to Order
        Payment payment = Payment.builder()
                .id(UUID.randomUUID().toString())
                .order(order)
                .paymentMethod(paymentMethod)
                .paymentStatus(PaymentStatus.PENDING)
                .amount(order.getTotalAmount())
                .currency("INR")
                .build();

        // Set payment on order so cascade persists it automatically
        order.setPayment(payment);

        // Save order — cascades to Payment and OrderItems
        Order savedOrder = orderRepository.save(order);

        // Clear cart immediately for Cash on Delivery (COD); online carts are cleared upon successful verification
        if (paymentMethod == PaymentMethod.COD) {
            cartService.clearCart(email);
            // Trigger tracking simulator directly for COD since it is immediately confirmed
            simulateOrderTracking(savedOrder.getId());
        }

        return OrderMapper.toDto(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(String email, String orderId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Verify order ownership
        if (!order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You do not have permission to view this order");
        }

        return OrderMapper.toDto(order);
    }

    public OrderDto updateOrderStatus(String orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setStatus(status);
        Order savedOrder = orderRepository.save(order);
        return OrderMapper.toDto(savedOrder);
    }

    public List<CartItemDto> reorderOrder(String email, String orderId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Verify ownership
        if (!order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You do not have permission to reorder this order");
        }

        // Add each item from the original order to the cart
        for (OrderItem item : order.getItems()) {
            try {
                cartService.addItemToCart(email,
                        new com.zestigo.dto.CartRequest(item.getFoodItem().getId(), item.getQuantity()));
            } catch (Exception e) {
                log.warn("Could not add item {} to cart during reorder: {}", item.getFoodItem().getId(), e.getMessage());
            }
        }

        return cartService.getCartItems(email);
    }

    public void simulateOrderTracking(String orderId) {
        log.info("Starting Swiggy-like live order status simulation for Order ID: {}", orderId);
        
        // 10 seconds ➔ PREPARING
        scheduler.schedule(() -> advanceStatus(orderId, OrderStatus.PREPARING), 10, java.util.concurrent.TimeUnit.SECONDS);
        
        // 25 seconds ➔ PICKED_UP
        scheduler.schedule(() -> advanceStatus(orderId, OrderStatus.PICKED_UP), 25, java.util.concurrent.TimeUnit.SECONDS);
        
        // 40 seconds ➔ OUT_FOR_DELIVERY
        scheduler.schedule(() -> advanceStatus(orderId, OrderStatus.OUT_FOR_DELIVERY), 40, java.util.concurrent.TimeUnit.SECONDS);
        
        // 60 seconds ➔ DELIVERED
        scheduler.schedule(() -> advanceStatus(orderId, OrderStatus.DELIVERED), 60, java.util.concurrent.TimeUnit.SECONDS);
    }

    @Transactional
    public void advanceStatus(String orderId, OrderStatus nextStatus) {
        try {
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order != null) {
                // Prevent advancing cancelled/delivered orders
                if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
                    return;
                }
                order.setStatus(nextStatus);
                orderRepository.save(order);
                log.info("Simulator: Advanced Order {} status to {}", orderId, nextStatus);
            }
        } catch (Exception e) {
            log.error("Simulator Error: Failed to advance status for order {}: {}", orderId, e.getMessage());
        }
    }
}
