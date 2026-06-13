package com.zestigo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "addresses")
public class Address {

    @Id
    @NotBlank
    @Size(max = 36)
    private String id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    private String label;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String line;

    @Column(name = "is_default", nullable = false)
    private boolean isDefault;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "place_id", length = 255)
    private String placeId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Address() {
    }

    public Address(String id, User user, String label, String line, boolean isDefault,
                   Double latitude, Double longitude, String placeId, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.label = label;
        this.line = line;
        this.isDefault = isDefault;
        this.latitude = latitude;
        this.longitude = longitude;
        this.placeId = placeId;
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

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getLine() { return line; }
    public void setLine(String line) { this.line = line; }

    public boolean isDefault() { return isDefault; }
    public void setDefault(boolean isDefault) { this.isDefault = isDefault; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getPlaceId() { return placeId; }
    public void setPlaceId(String placeId) { this.placeId = placeId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder
    public static AddressBuilder builder() {
        return new AddressBuilder();
    }

    public static class AddressBuilder {
        private String id;
        private User user;
        private String label;
        private String line;
        private boolean isDefault;
        private Double latitude;
        private Double longitude;
        private String placeId;

        public AddressBuilder id(String id) { this.id = id; return this; }
        public AddressBuilder user(User user) { this.user = user; return this; }
        public AddressBuilder label(String label) { this.label = label; return this; }
        public AddressBuilder line(String line) { this.line = line; return this; }
        public AddressBuilder isDefault(boolean isDefault) { this.isDefault = isDefault; return this; }
        public AddressBuilder latitude(Double latitude) { this.latitude = latitude; return this; }
        public AddressBuilder longitude(Double longitude) { this.longitude = longitude; return this; }
        public AddressBuilder placeId(String placeId) { this.placeId = placeId; return this; }

        public Address build() {
            return new Address(id, user, label, line, isDefault, latitude, longitude, placeId, null);
        }
    }
}
