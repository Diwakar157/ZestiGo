package com.zestigo.dto;

import java.math.BigDecimal;
import java.util.List;

public class CreateOrderRequest {
    private List<CartItemDto> items;
    private BigDecimal total;
    private String address;
    private String restaurantName;
    private String paymentMethod;

    public CreateOrderRequest() {
    }

    public CreateOrderRequest(List<CartItemDto> items, BigDecimal total, String address, String restaurantName, String paymentMethod) {
        this.items = items;
        this.total = total;
        this.address = address;
        this.restaurantName = restaurantName;
        this.paymentMethod = paymentMethod;
    }

    // Getters and Setters
    public List<CartItemDto> getItems() { return items; }
    public void setItems(List<CartItemDto> items) { this.items = items; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getRestaurantName() { return restaurantName; }
    public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    // Builder
    public static CreateOrderRequestBuilder builder() {
        return new CreateOrderRequestBuilder();
    }

    public static class CreateOrderRequestBuilder {
        private List<CartItemDto> items;
        private BigDecimal total;
        private String address;
        private String restaurantName;
        private String paymentMethod;

        public CreateOrderRequestBuilder items(List<CartItemDto> items) { this.items = items; return this; }
        public CreateOrderRequestBuilder total(BigDecimal total) { this.total = total; return this; }
        public CreateOrderRequestBuilder address(String address) { this.address = address; return this; }
        public CreateOrderRequestBuilder restaurantName(String restaurantName) { this.restaurantName = restaurantName; return this; }
        public CreateOrderRequestBuilder paymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; return this; }

        public CreateOrderRequest build() {
            return new CreateOrderRequest(items, total, address, restaurantName, paymentMethod);
        }
    }
}
