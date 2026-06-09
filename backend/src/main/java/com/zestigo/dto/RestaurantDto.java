package com.zestigo.dto;

import java.math.BigDecimal;
import java.util.List;

public class RestaurantDto {
    private String id;
    private String name;
    private String cuisine;
    private List<String> categoryIds;
    private BigDecimal rating;
    private Integer reviews;
    private Integer deliveryTime;
    private BigDecimal deliveryFee;
    private BigDecimal distance;
    private String priceRange;
    private String image;
    private String banner;
    private String address;
    private Boolean promoted;
    private String description;

    public RestaurantDto() {
    }

    public RestaurantDto(String id, String name, String cuisine, List<String> categoryIds, BigDecimal rating, Integer reviews, Integer deliveryTime, BigDecimal deliveryFee, BigDecimal distance, String priceRange, String image, String banner, String address, Boolean promoted, String description) {
        this.id = id;
        this.name = name;
        this.cuisine = cuisine;
        this.categoryIds = categoryIds;
        this.rating = rating;
        this.reviews = reviews;
        this.deliveryTime = deliveryTime;
        this.deliveryFee = deliveryFee;
        this.distance = distance;
        this.priceRange = priceRange;
        this.image = image;
        this.banner = banner;
        this.address = address;
        this.promoted = promoted;
        this.description = description;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCuisine() { return cuisine; }
    public void setCuisine(String cuisine) { this.cuisine = cuisine; }

    public List<String> getCategoryIds() { return categoryIds; }
    public void setCategoryIds(List<String> categoryIds) { this.categoryIds = categoryIds; }

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    public Integer getReviews() { return reviews; }
    public void setReviews(Integer reviews) { this.reviews = reviews; }

    public Integer getDeliveryTime() { return deliveryTime; }
    public void setDeliveryTime(Integer deliveryTime) { this.deliveryTime = deliveryTime; }

    public BigDecimal getDeliveryFee() { return deliveryFee; }
    public void setDeliveryFee(BigDecimal deliveryFee) { this.deliveryFee = deliveryFee; }

    public BigDecimal getDistance() { return distance; }
    public void setDistance(BigDecimal distance) { this.distance = distance; }

    public String getPriceRange() { return priceRange; }
    public void setPriceRange(String priceRange) { this.priceRange = priceRange; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getBanner() { return banner; }
    public void setBanner(String banner) { this.banner = banner; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Boolean getPromoted() { return promoted; }
    public void setPromoted(Boolean promoted) { this.promoted = promoted; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    // Builder
    public static RestaurantDtoBuilder builder() {
        return new RestaurantDtoBuilder();
    }

    public static class RestaurantDtoBuilder {
        private String id;
        private String name;
        private String cuisine;
        private List<String> categoryIds;
        private BigDecimal rating;
        private Integer reviews;
        private Integer deliveryTime;
        private BigDecimal deliveryFee;
        private BigDecimal distance;
        private String priceRange;
        private String image;
        private String banner;
        private String address;
        private Boolean promoted;
        private String description;

        public RestaurantDtoBuilder id(String id) { this.id = id; return this; }
        public RestaurantDtoBuilder name(String name) { this.name = name; return this; }
        public RestaurantDtoBuilder cuisine(String cuisine) { this.cuisine = cuisine; return this; }
        public RestaurantDtoBuilder categoryIds(List<String> categoryIds) { this.categoryIds = categoryIds; return this; }
        public RestaurantDtoBuilder rating(BigDecimal rating) { this.rating = rating; return this; }
        public RestaurantDtoBuilder reviews(Integer reviews) { this.reviews = reviews; return this; }
        public RestaurantDtoBuilder deliveryTime(Integer deliveryTime) { this.deliveryTime = deliveryTime; return this; }
        public RestaurantDtoBuilder deliveryFee(BigDecimal deliveryFee) { this.deliveryFee = deliveryFee; return this; }
        public RestaurantDtoBuilder distance(BigDecimal distance) { this.distance = distance; return this; }
        public RestaurantDtoBuilder priceRange(String priceRange) { this.priceRange = priceRange; return this; }
        public RestaurantDtoBuilder image(String image) { this.image = image; return this; }
        public RestaurantDtoBuilder banner(String banner) { this.banner = banner; return this; }
        public RestaurantDtoBuilder address(String address) { this.address = address; return this; }
        public RestaurantDtoBuilder promoted(Boolean promoted) { this.promoted = promoted; return this; }
        public RestaurantDtoBuilder description(String description) { this.description = description; return this; }

        public RestaurantDto build() {
            return new RestaurantDto(id, name, cuisine, categoryIds, rating, reviews, deliveryTime, deliveryFee, distance, priceRange, image, banner, address, promoted, description);
        }
    }
}
