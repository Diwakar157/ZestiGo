package com.zestigo.service;

import com.zestigo.dto.FoodItemDto;
import com.zestigo.entity.FoodItem;
import com.zestigo.exception.ResourceNotFoundException;
import com.zestigo.mapper.FoodItemMapper;
import com.zestigo.repository.FoodItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class FoodService {

    private final FoodItemRepository foodItemRepository;

    public FoodService(FoodItemRepository foodItemRepository) {
        this.foodItemRepository = foodItemRepository;
    }

    public List<FoodItemDto> getFoods() {
        return foodItemRepository.findAll().stream()
                .map(FoodItemMapper::toDto)
                .collect(Collectors.toList());
    }

    public FoodItemDto getFoodById(String id) {
        FoodItem foodItem = foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with id: " + id));
        return FoodItemMapper.toDto(foodItem);
    }

    public List<FoodItemDto> getFoodsByRestaurant(String restaurantId) {
        return foodItemRepository.findByRestaurantId(restaurantId).stream()
                .map(FoodItemMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<FoodItemDto> getFeaturedFoods() {
        return foodItemRepository.findByPopularTrue().stream()
                .map(FoodItemMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<FoodItemDto> getRecommendedFoods() {
        return foodItemRepository.findTop4ByOrderByRatingDesc().stream()
                .map(FoodItemMapper::toDto)
                .collect(Collectors.toList());
    }
}
