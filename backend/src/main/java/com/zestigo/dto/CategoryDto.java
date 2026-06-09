package com.zestigo.dto;

public class CategoryDto {
    private String id;
    private String name;
    private String icon;
    private String image;

    public CategoryDto() {
    }

    public CategoryDto(String id, String name, String icon, String image) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.image = image;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    // Builder
    public static CategoryDtoBuilder builder() {
        return new CategoryDtoBuilder();
    }

    public static class CategoryDtoBuilder {
        private String id;
        private String name;
        private String icon;
        private String image;

        public CategoryDtoBuilder id(String id) { this.id = id; return this; }
        public CategoryDtoBuilder name(String name) { this.name = name; return this; }
        public CategoryDtoBuilder icon(String icon) { this.icon = icon; return this; }
        public CategoryDtoBuilder image(String image) { this.image = image; return this; }

        public CategoryDto build() {
            return new CategoryDto(id, name, icon, image);
        }
    }
}
