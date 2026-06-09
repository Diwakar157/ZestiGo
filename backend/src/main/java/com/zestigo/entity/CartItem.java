package com.zestigo.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "cart_items", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"cart_id", "food_item_id"})
})
public class CartItem {

    @Id
    private String id;

    @JsonBackReference("cart-items")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_item_id", nullable = false)
    private FoodItem foodItem;

    @Column(nullable = false)
    private Integer quantity;

    public CartItem() {
    }

    public CartItem(String id, Cart cart, FoodItem foodItem, Integer quantity) {
        this.id = id;
        this.cart = cart;
        this.foodItem = foodItem;
        this.quantity = quantity;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Cart getCart() { return cart; }
    public void setCart(Cart cart) { this.cart = cart; }

    public FoodItem getFoodItem() { return foodItem; }
    public void setFoodItem(FoodItem foodItem) { this.foodItem = foodItem; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    // Builder
    public static CartItemBuilder builder() {
        return new CartItemBuilder();
    }

    public static class CartItemBuilder {
        private String id;
        private Cart cart;
        private FoodItem foodItem;
        private Integer quantity;

        public CartItemBuilder id(String id) { this.id = id; return this; }
        public CartItemBuilder cart(Cart cart) { this.cart = cart; return this; }
        public CartItemBuilder foodItem(FoodItem foodItem) { this.foodItem = foodItem; return this; }
        public CartItemBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }

        public CartItem build() {
            return new CartItem(id, cart, foodItem, quantity);
        }
    }
}
