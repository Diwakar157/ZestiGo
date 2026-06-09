package com.zestigo.dto;

import jakarta.validation.constraints.NotBlank;

public class WishlistToggleRequest {

    @NotBlank(message = "Kind is required (restaurants or foods)")
    private String kind;

    @NotBlank(message = "ID is required")
    private String id;

    public WishlistToggleRequest() {
    }

    public WishlistToggleRequest(String kind, String id) {
        this.kind = kind;
        this.id = id;
    }

    // Getters and Setters
    public String getKind() { return kind; }
    public void setKind(String kind) { this.kind = kind; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    // Builder
    public static WishlistToggleRequestBuilder builder() {
        return new WishlistToggleRequestBuilder();
    }

    public static class WishlistToggleRequestBuilder {
        private String kind;
        private String id;

        public WishlistToggleRequestBuilder kind(String kind) { this.kind = kind; return this; }
        public WishlistToggleRequestBuilder id(String id) { this.id = id; return this; }

        public WishlistToggleRequest build() {
            return new WishlistToggleRequest(kind, id);
        }
    }
}
