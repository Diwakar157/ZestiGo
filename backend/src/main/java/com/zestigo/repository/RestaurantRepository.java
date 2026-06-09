package com.zestigo.repository;

import com.zestigo.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, String> {

    @Query("SELECT DISTINCT r FROM Restaurant r LEFT JOIN r.categories c " +
           "WHERE (:search IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.cuisine) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:categoryId IS NULL OR c.id = :categoryId)")
    List<Restaurant> findBySearchAndCategory(@Param("search") String search, @Param("categoryId") String categoryId);

    List<Restaurant> findByPromotedTrue();
}
