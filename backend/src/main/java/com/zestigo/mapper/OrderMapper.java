package com.zestigo.mapper;

import com.zestigo.dto.CartItemDto;
import com.zestigo.dto.OrderDto;
import com.zestigo.entity.Order;

import java.util.stream.Collectors;

public class OrderMapper {
    public static OrderDto toDto(Order order) {
        if (order == null) return null;
        return OrderDto.builder()
                .id(order.getId())
                .items(order.getItems().stream()
                        .map(item -> CartItemDto.builder()
                                .food(FoodItemMapper.toDto(item.getFoodItem()))
                                .quantity(item.getQuantity())
                                .build())
                        .collect(Collectors.toList()))
                .total(order.getTotalAmount())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt().toString())
                .restaurantName(order.getRestaurantName())
                .address(order.getAddress())
                .build();
    }
}
