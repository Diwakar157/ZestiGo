package com.zestigo.dto;

import java.math.BigDecimal;

public class FoodItemDto {
    private String id;
    private String restaurantId;
    private String name;
    private String description;
    private BigDecimal price;
    private String image;
    private String category;
    private BigDecimal rating;
    private Integer reviews;
    private Boolean popular;
    private Boolean veg;

    public FoodItemDto() {
    }

    public FoodItemDto(String id, String restaurantId, String name, String description, BigDecimal price, String image, String category, BigDecimal rating, Integer reviews, Boolean popular, Boolean veg) {
        this.id = id;
        this.restaurantId = restaurantId;
        this.name = name;
        this.description = description;
        this.price = price;
        this.image = image;
        this.category = category;
        this.rating = rating;
        this.reviews = reviews;
        this.popular = popular;
        this.veg = veg;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRestaurantId() { return restaurantId; }
    public void setRestaurantId(String restaurantId) { this.restaurantId = restaurantId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    public Integer getReviews() { return reviews; }
    public void setReviews(Integer reviews) { this.reviews = reviews; }

    public Boolean getPopular() { return popular; }
    public void setPopular(Boolean popular) { this.popular = popular; }

    public Boolean getVeg() { return veg; }
    public void setVeg(Boolean veg) { this.veg = veg; }

    // Builder
    public static FoodItemDtoBuilder builder() {
        return new FoodItemDtoBuilder();
    }

    public static class FoodItemDtoBuilder {
        private String id;
        private String restaurantId;
        private String name;
        private String description;
        private BigDecimal price;
        private String image;
        private String category;
        private BigDecimal rating;
        private Integer reviews;
        private Boolean popular;
        private Boolean veg;

        public FoodItemDtoBuilder id(String id) { this.id = id; return this; }
        public FoodItemDtoBuilder restaurantId(String restaurantId) { this.restaurantId = restaurantId; return this; }
        public FoodItemDtoBuilder name(String name) { this.name = name; return this; }
        public FoodItemDtoBuilder description(String description) { this.description = description; return this; }
        public FoodItemDtoBuilder price(BigDecimal price) { this.price = price; return this; }
        public FoodItemDtoBuilder imageUrl(String imageUrl) { this.image = imageUrl; return this; }
        public FoodItemDtoBuilder image(String image) { this.image = image; return this; }
        public FoodItemDtoBuilder category(String category) { this.category = category; return this; }
        public FoodItemDtoBuilder rating(BigDecimal rating) { this.rating = rating; return this; }
        public FoodItemDtoBuilder reviews(Integer reviews) { this.reviews = reviews; return this; }
        public FoodItemDtoBuilder popular(Boolean popular) { this.popular = popular; return this; }
        public FoodItemDtoBuilder veg(Boolean veg) { this.veg = veg; return this; }

        public FoodItemDto build() {
            return new FoodItemDto(id, restaurantId, name, description, price, image, category, rating, reviews, popular, veg);
        }
    }
}
