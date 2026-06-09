package com.zestigo.repository;

import com.zestigo.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, String> {
    List<FoodItem> findByRestaurantId(String restaurantId);
    List<FoodItem> findByPopularTrue();
    List<FoodItem> findTop4ByOrderByRatingDesc();
}
