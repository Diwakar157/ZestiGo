package com.zestigo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CartRequest {

    @NotBlank(message = "Food item ID is required")
    private String foodItemId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    public CartRequest() {
    }

    public CartRequest(String foodItemId, Integer quantity) {
        this.foodItemId = foodItemId;
        this.quantity = quantity;
    }

    // Getters and Setters
    public String getFoodItemId() { return foodItemId; }
    public void setFoodItemId(String foodItemId) { this.foodItemId = foodItemId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    // Builder
    public static CartRequestBuilder builder() {
        return new CartRequestBuilder();
    }

    public static class CartRequestBuilder {
        private String foodItemId;
        private Integer quantity;

        public CartRequestBuilder foodItemId(String foodItemId) { this.foodItemId = foodItemId; return this; }
        public CartRequestBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }

        public CartRequest build() {
            return new CartRequest(foodItemId, quantity);
        }
    }
}
