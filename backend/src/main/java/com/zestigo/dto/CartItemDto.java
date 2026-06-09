package com.zestigo.dto;

public class CartItemDto {
    private FoodItemDto food;
    private Integer quantity;

    public CartItemDto() {
    }

    public CartItemDto(FoodItemDto food, Integer quantity) {
        this.food = food;
        this.quantity = quantity;
    }

    // Getters and Setters
    public FoodItemDto getFood() { return food; }
    public void setFood(FoodItemDto food) { this.food = food; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    // Builder
    public static CartItemDtoBuilder builder() {
        return new CartItemDtoBuilder();
    }

    public static class CartItemDtoBuilder {
        private FoodItemDto food;
        private Integer quantity;

        public CartItemDtoBuilder food(FoodItemDto food) { this.food = food; return this; }
        public CartItemDtoBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }

        public CartItemDto build() {
            return new CartItemDto(food, quantity);
        }
    }
}
