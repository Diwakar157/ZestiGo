package com.zestigo.dto;

import java.math.BigDecimal;
import java.util.List;

public class OrderDto {
    private String id;
    private List<CartItemDto> items;
    private BigDecimal total;
    private String status;
    private String createdAt;
    private String restaurantName;
    private String address;

    public OrderDto() {
    }

    public OrderDto(String id, List<CartItemDto> items, BigDecimal total, String status, String createdAt, String restaurantName, String address) {
        this.id = id;
        this.items = items;
        this.total = total;
        this.status = status;
        this.createdAt = createdAt;
        this.restaurantName = restaurantName;
        this.address = address;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public List<CartItemDto> getItems() { return items; }
    public void setItems(List<CartItemDto> items) { this.items = items; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getRestaurantName() { return restaurantName; }
    public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    // Builder
    public static OrderDtoBuilder builder() {
        return new OrderDtoBuilder();
    }

    public static class OrderDtoBuilder {
        private String id;
        private List<CartItemDto> items;
        private BigDecimal total;
        private String status;
        private String createdAt;
        private String restaurantName;
        private String address;

        public OrderDtoBuilder id(String id) { this.id = id; return this; }
        public OrderDtoBuilder items(List<CartItemDto> items) { this.items = items; return this; }
        public OrderDtoBuilder total(BigDecimal total) { this.total = total; return this; }
        public OrderDtoBuilder status(String status) { this.status = status; return this; }
        public OrderDtoBuilder createdAt(String createdAt) { this.createdAt = createdAt; return this; }
        public OrderDtoBuilder restaurantName(String restaurantName) { this.restaurantName = restaurantName; return this; }
        public OrderDtoBuilder address(String address) { this.address = address; return this; }

        public OrderDto build() {
            return new OrderDto(id, items, total, status, createdAt, restaurantName, address);
        }
    }
}
