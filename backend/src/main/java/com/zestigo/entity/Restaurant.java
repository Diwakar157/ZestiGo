package com.zestigo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "restaurants")
public class Restaurant {

    @Id
    @NotBlank
    @Size(max = 36)
    private String id;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false, length = 255)
    private String cuisine;

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
    @Positive
    @Column(name = "delivery_time", nullable = false)
    private Integer deliveryTime;

    @NotNull
    @Min(0)
    @Column(name = "delivery_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal deliveryFee;

    @NotNull
    @Positive
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal distance;

    @NotBlank
    @Size(max = 5)
    @Column(name = "price_range", nullable = false, length = 5)
    private String priceRange;

    @Size(max = 255)
    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Size(max = 255)
    @Column(name = "banner_url", length = 255)
    private String bannerUrl;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    private Boolean promoted;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "restaurant_categories",
        joinColumns = @JoinColumn(name = "restaurant_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories = new HashSet<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Restaurant() {
    }

    public Restaurant(String id, String name, String cuisine, BigDecimal rating, Integer reviewsCount, Integer deliveryTime, BigDecimal deliveryFee, BigDecimal distance, String priceRange, String imageUrl, String bannerUrl, String address, Boolean promoted, String description, Set<Category> categories, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.cuisine = cuisine;
        this.rating = rating;
        this.reviewsCount = reviewsCount;
        this.deliveryTime = deliveryTime;
        this.deliveryFee = deliveryFee;
        this.distance = distance;
        this.priceRange = priceRange;
        this.imageUrl = imageUrl;
        this.bannerUrl = bannerUrl;
        this.address = address;
        this.promoted = promoted;
        this.description = description;
        this.categories = categories != null ? categories : new HashSet<>();
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.promoted == null) {
            this.promoted = false;
        }
        if (this.rating == null) {
            this.rating = BigDecimal.ZERO;
        }
        if (this.reviewsCount == null) {
            this.reviewsCount = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCuisine() { return cuisine; }
    public void setCuisine(String cuisine) { this.cuisine = cuisine; }

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    public Integer getReviewsCount() { return reviewsCount; }
    public void setReviewsCount(Integer reviewsCount) { this.reviewsCount = reviewsCount; }

    public Integer getDeliveryTime() { return deliveryTime; }
    public void setDeliveryTime(Integer deliveryTime) { this.deliveryTime = deliveryTime; }

    public BigDecimal getDeliveryFee() { return deliveryFee; }
    public void setDeliveryFee(BigDecimal deliveryFee) { this.deliveryFee = deliveryFee; }

    public BigDecimal getDistance() { return distance; }
    public void setDistance(BigDecimal distance) { this.distance = distance; }

    public String getPriceRange() { return priceRange; }
    public void setPriceRange(String priceRange) { this.priceRange = priceRange; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getBannerUrl() { return bannerUrl; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Boolean getPromoted() { return promoted; }
    public void setPromoted(Boolean promoted) { this.promoted = promoted; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Set<Category> getCategories() { return categories; }
    public void setCategories(Set<Category> categories) { this.categories = categories; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder
    public static RestaurantBuilder builder() {
        return new RestaurantBuilder();
    }

    public static class RestaurantBuilder {
        private String id;
        private String name;
        private String cuisine;
        private BigDecimal rating;
        private Integer reviewsCount;
        private Integer deliveryTime;
        private BigDecimal deliveryFee;
        private BigDecimal distance;
        private String priceRange;
        private String imageUrl;
        private String bannerUrl;
        private String address;
        private Boolean promoted;
        private String description;
        private Set<Category> categories = new HashSet<>();

        public RestaurantBuilder id(String id) { this.id = id; return this; }
        public RestaurantBuilder name(String name) { this.name = name; return this; }
        public RestaurantBuilder cuisine(String cuisine) { this.cuisine = cuisine; return this; }
        public RestaurantBuilder rating(BigDecimal rating) { this.rating = rating; return this; }
        public RestaurantBuilder reviewsCount(Integer reviewsCount) { this.reviewsCount = reviewsCount; return this; }
        public RestaurantBuilder deliveryTime(Integer deliveryTime) { this.deliveryTime = deliveryTime; return this; }
        public RestaurantBuilder deliveryFee(BigDecimal deliveryFee) { this.deliveryFee = deliveryFee; return this; }
        public RestaurantBuilder distance(BigDecimal distance) { this.distance = distance; return this; }
        public RestaurantBuilder priceRange(String priceRange) { this.priceRange = priceRange; return this; }
        public RestaurantBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public RestaurantBuilder bannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; return this; }
        public RestaurantBuilder address(String address) { this.address = address; return this; }
        public RestaurantBuilder promoted(Boolean promoted) { this.promoted = promoted; return this; }
        public RestaurantBuilder description(String description) { this.description = description; return this; }
        public RestaurantBuilder categories(Set<Category> categories) { this.categories = categories; return this; }

        public Restaurant build() {
            return new Restaurant(id, name, cuisine, rating, reviewsCount, deliveryTime, deliveryFee, distance, priceRange, imageUrl, bannerUrl, address, promoted, description, categories, null, null);
        }
    }
}
