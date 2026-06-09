package com.zestigo.controller;

import com.zestigo.dto.CategoryDto;
import com.zestigo.dto.RestaurantDto;
import com.zestigo.service.RestaurantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    private final RestaurantService restaurantService;

    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }

    @GetMapping
    public ResponseEntity<List<RestaurantDto>> getRestaurants(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "categoryId", required = false) String categoryId,
            @RequestParam(value = "sort", required = false) String sort) {
        
        List<RestaurantDto> list = restaurantService.getRestaurants(search, categoryId, sort);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantDto> getRestaurantById(@PathVariable("id") String id) {
        RestaurantDto restaurant = restaurantService.getRestaurantById(id);
        return ResponseEntity.ok(restaurant);
    }

    @GetMapping("/featured")
    public ResponseEntity<List<RestaurantDto>> getFeatured() {
        List<RestaurantDto> list = restaurantService.getPopularRestaurants();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDto>> getCategories() {
        List<CategoryDto> list = restaurantService.getCategories();
        return ResponseEntity.ok(list);
    }
}
