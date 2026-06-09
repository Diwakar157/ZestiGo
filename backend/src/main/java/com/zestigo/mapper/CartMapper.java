package com.zestigo.mapper;

import com.zestigo.dto.CartItemDto;
import com.zestigo.entity.CartItem;

public class CartMapper {
    public static CartItemDto toDto(CartItem item) {
        if (item == null) return null;
        return CartItemDto.builder()
                .food(FoodItemMapper.toDto(item.getFoodItem()))
                .quantity(item.getQuantity())
                .build();
    }
}
