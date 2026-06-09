package com.zestigo.mapper;

import com.zestigo.dto.RestaurantDto;
import com.zestigo.entity.Category;
import com.zestigo.entity.Restaurant;

import java.util.stream.Collectors;

public class RestaurantMapper {
    public static RestaurantDto toDto(Restaurant restaurant) {
        if (restaurant == null) return null;
        return RestaurantDto.builder()
                .id(restaurant.getId())
                .name(restaurant.getName())
                .cuisine(restaurant.getCuisine())
                .categoryIds(restaurant.getCategories().stream().map(Category::getId).collect(Collectors.toList()))
                .rating(restaurant.getRating())
                .reviews(restaurant.getReviewsCount())
                .deliveryTime(restaurant.getDeliveryTime())
                .deliveryFee(restaurant.getDeliveryFee())
                .distance(restaurant.getDistance())
                .priceRange(restaurant.getPriceRange())
                .image(restaurant.getImageUrl())
                .banner(restaurant.getBannerUrl())
                .address(restaurant.getAddress())
                .promoted(restaurant.getPromoted())
                .description(restaurant.getDescription())
                .build();
    }
}
