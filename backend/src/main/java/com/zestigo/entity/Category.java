package com.zestigo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "food_categories")
public class Category {

    @Id
    @NotBlank
    @Size(max = 36)
    private String id;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Size(max = 10)
    @Column(length = 10)
    private String icon;

    @Size(max = 255)
    @Column(name = "image_url", length = 255)
    private String imageUrl;

    public Category() {
    }

    public Category(String id, String name, String icon, String imageUrl) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.imageUrl = imageUrl;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    // Builder
    public static CategoryBuilder builder() {
        return new CategoryBuilder();
    }

    public static class CategoryBuilder {
        private String id;
        private String name;
        private String icon;
        private String imageUrl;

        public CategoryBuilder id(String id) { this.id = id; return this; }
        public CategoryBuilder name(String name) { this.name = name; return this; }
        public CategoryBuilder icon(String icon) { this.icon = icon; return this; }
        public CategoryBuilder image(String image) { this.imageUrl = image; return this; }

        public Category build() {
            return new Category(id, name, icon, imageUrl);
        }
    }
}
