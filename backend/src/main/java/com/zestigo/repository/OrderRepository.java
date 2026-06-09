package com.zestigo.repository;

import com.zestigo.entity.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    @EntityGraph(attributePaths = {"items", "items.foodItem"})
    List<Order> findByUserIdOrderByCreatedAtDesc(String userId);
}
