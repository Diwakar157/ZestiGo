package com.zestigo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

@Entity
@Table(name = "food_items")
public class FoodItem {

    @Id
    @NotBlank
    @Size(max = 36)
    private String id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Positive
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Size(max = 255)
    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    private String category;

    @NotNull
    @Min(0)
    @Max(5)
    @Column(precision = 3, scale = 2)
    private BigDecimal rating;

    @NotNull
    @Min(0)
    @Column(name = "reviews_count")
    private Integer reviewsCount;

    @NotNull
    private Boolean popular;

    @NotNull
    private Boolean veg;

    public FoodItem() {
    }

    public FoodItem(String id, Restaurant restaurant, String name, String description, BigDecimal price, String imageUrl, String category, BigDecimal rating, Integer reviewsCount, Boolean popular, Boolean veg) {
        this.id = id;
        this.restaurant = restaurant;
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.category = category;
        this.rating = rating;
        this.reviewsCount = reviewsCount;
        this.popular = popular;
        this.veg = veg;
    }

    @PrePersist
    protected void onCreate() {
        if (this.popular == null) {
            this.popular = false;
        }
        if (this.veg == null) {
            this.veg = true;
        }
        if (this.rating == null) {
            this.rating = BigDecimal.ZERO;
        }
        if (this.reviewsCount == null) {
            this.reviewsCount = 0;
        }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Restaurant getRestaurant() { return restaurant; }
    public void setRestaurant(Restaurant restaurant) { this.restaurant = restaurant; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    public Integer getReviewsCount() { return reviewsCount; }
    public void setReviewsCount(Integer reviewsCount) { this.reviewsCount = reviewsCount; }

    public Boolean getPopular() { return popular; }
    public void setPopular(Boolean popular) { this.popular = popular; }

    public Boolean getVeg() { return veg; }
    public void setVeg(Boolean veg) { this.veg = veg; }

    // Builder
    public static FoodItemBuilder builder() {
        return new FoodItemBuilder();
    }

    public static class FoodItemBuilder {
        private String id;
        private Restaurant restaurant;
        private String name;
        private String description;
        private BigDecimal price;
        private String imageUrl;
        private String category;
        private BigDecimal rating;
        private Integer reviewsCount;
        private Boolean popular;
        private Boolean veg;

        public FoodItemBuilder id(String id) { this.id = id; return this; }
        public FoodItemBuilder restaurant(Restaurant restaurant) { this.restaurant = restaurant; return this; }
        public FoodItemBuilder name(String name) { this.name = name; return this; }
        public FoodItemBuilder description(String description) { this.description = description; return this; }
        public FoodItemBuilder price(BigDecimal price) { this.price = price; return this; }
        public FoodItemBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public FoodItemBuilder category(String category) { this.category = category; return this; }
        public FoodItemBuilder rating(BigDecimal rating) { this.rating = rating; return this; }
        public FoodItemBuilder reviewsCount(Integer reviewsCount) { this.reviewsCount = reviewsCount; return this; }
        public FoodItemBuilder popular(Boolean popular) { this.popular = popular; return this; }
        public FoodItemBuilder veg(Boolean veg) { this.veg = veg; return this; }

        public FoodItem build() {
            return new FoodItem(id, restaurant, name, description, price, imageUrl, category, rating, reviewsCount, popular, veg);
        }
    }
}
