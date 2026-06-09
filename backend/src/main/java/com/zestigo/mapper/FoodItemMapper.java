package com.zestigo.mapper;

import com.zestigo.dto.FoodItemDto;
import com.zestigo.entity.FoodItem;

public class FoodItemMapper {
    public static FoodItemDto toDto(FoodItem foodItem) {
        if (foodItem == null) return null;
        return FoodItemDto.builder()
                .id(foodItem.getId())
                .restaurantId(foodItem.getRestaurant().getId())
                .name(foodItem.getName())
                .description(foodItem.getDescription())
                .price(foodItem.getPrice())
                .image(foodItem.getImageUrl())
                .category(foodItem.getCategory())
                .rating(foodItem.getRating())
                .reviews(foodItem.getReviewsCount())
                .popular(foodItem.getPopular())
                .veg(foodItem.getVeg())
                .build();
    }
}
