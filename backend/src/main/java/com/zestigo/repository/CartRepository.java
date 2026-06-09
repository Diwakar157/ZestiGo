package com.zestigo.repository;

import com.zestigo.entity.Cart;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, String> {
    @EntityGraph(attributePaths = {"items", "items.foodItem"})
    Optional<Cart> findByUserId(String userId);
}
