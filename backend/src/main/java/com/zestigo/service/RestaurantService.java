package com.zestigo.service;

import com.zestigo.dto.CategoryDto;
import com.zestigo.dto.RestaurantDto;
import com.zestigo.entity.Restaurant;
import com.zestigo.exception.ResourceNotFoundException;
import com.zestigo.mapper.CategoryMapper;
import com.zestigo.mapper.RestaurantMapper;
import com.zestigo.repository.CategoryRepository;
import com.zestigo.repository.RestaurantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final CategoryRepository categoryRepository;

    public RestaurantService(RestaurantRepository restaurantRepository, CategoryRepository categoryRepository) {
        this.restaurantRepository = restaurantRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<RestaurantDto> getRestaurants(String search, String categoryId, String sort) {
        List<Restaurant> list = restaurantRepository.findBySearchAndCategory(
                search != null && search.trim().isEmpty() ? null : search, 
                categoryId != null && categoryId.trim().isEmpty() ? null : categoryId
        );

        // Optional sorting
        if ("rating".equalsIgnoreCase(sort)) {
            list.sort(Comparator.comparing(Restaurant::getRating, Comparator.nullsLast(Comparator.reverseOrder())));
        } else if ("delivery".equalsIgnoreCase(sort)) {
            list.sort(Comparator.comparing(Restaurant::getDeliveryTime, Comparator.nullsLast(Comparator.naturalOrder())));
        }

        return list.stream()
                .map(RestaurantMapper::toDto)
                .collect(Collectors.toList());
    }

    public RestaurantDto getRestaurantById(String id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));
        return RestaurantMapper.toDto(restaurant);
    }

    public List<CategoryDto> getCategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<RestaurantDto> getPopularRestaurants() {
        return restaurantRepository.findByPromotedTrue().stream()
                .map(RestaurantMapper::toDto)
                .collect(Collectors.toList());
    }
}
