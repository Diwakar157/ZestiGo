package com.zestigo.dto;

import java.util.List;

public class WishlistResponse {
    private List<String> restaurants;
    private List<String> foods;

    public WishlistResponse() {
    }

    public WishlistResponse(List<String> restaurants, List<String> foods) {
        this.restaurants = restaurants;
        this.foods = foods;
    }

    // Getters and Setters
    public List<String> getRestaurants() { return restaurants; }
    public void setRestaurants(List<String> restaurants) { this.restaurants = restaurants; }

    public List<String> getFoods() { return foods; }
    public void setFoods(List<String> foods) { this.foods = foods; }

    // Builder
    public static WishlistResponseBuilder builder() {
        return new WishlistResponseBuilder();
    }

    public static class WishlistResponseBuilder {
        private List<String> restaurants;
        private List<String> foods;

        public WishlistResponseBuilder restaurants(List<String> restaurants) { this.restaurants = restaurants; return this; }
        public WishlistResponseBuilder foods(List<String> foods) { this.foods = foods; return this; }

        public WishlistResponse build() {
            return new WishlistResponse(restaurants, foods);
        }
    }
}
