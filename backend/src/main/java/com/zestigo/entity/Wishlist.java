package com.zestigo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "wishlist", uniqueConstraints = {
    @UniqueConstraint(name = "uk_wishlist_user_item_type", columnNames = {"user_id", "item_id", "type"})
})
public class Wishlist {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "item_id", nullable = false, length = 36)
    private String itemId;

    @Column(nullable = false, length = 20)
    private String type; // 'restaurants' or 'foods'

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Wishlist() {
    }

    public Wishlist(String id, User user, String itemId, String type, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.itemId = itemId;
        this.type = type;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getItemId() { return itemId; }
    public void setItemId(String itemId) { this.itemId = itemId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder
    public static WishlistBuilder builder() {
        return new WishlistBuilder();
    }

    public static class WishlistBuilder {
        private String id;
        private User user;
        private String itemId;
        private String type;

        public WishlistBuilder id(String id) { this.id = id; return this; }
        public WishlistBuilder user(User user) { this.user = user; return this; }
        public WishlistBuilder itemId(String itemId) { this.itemId = itemId; return this; }
        public WishlistBuilder type(String type) { this.type = type; return this; }

        public Wishlist build() {
            return new Wishlist(id, user, itemId, type, null);
        }
    }
}
