package com.zestigo.controller;

import com.zestigo.dto.FoodItemDto;
import com.zestigo.service.FoodService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/foods")
public class FoodController {

    private final FoodService foodService;

    public FoodController(FoodService foodService) {
        this.foodService = foodService;
    }

    @GetMapping
    public ResponseEntity<List<FoodItemDto>> getFoods() {
        return ResponseEntity.ok(foodService.getFoods());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodItemDto> getFoodById(@PathVariable("id") String id) {
        return ResponseEntity.ok(foodService.getFoodById(id));
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<FoodItemDto>> getFoodsByRestaurant(@PathVariable("restaurantId") String restaurantId) {
        return ResponseEntity.ok(foodService.getFoodsByRestaurant(restaurantId));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<FoodItemDto>> getFeatured() {
        return ResponseEntity.ok(foodService.getFeaturedFoods());
    }

    @GetMapping("/recommended")
    public ResponseEntity<List<FoodItemDto>> getRecommended() {
        return ResponseEntity.ok(foodService.getRecommendedFoods());
    }
}
