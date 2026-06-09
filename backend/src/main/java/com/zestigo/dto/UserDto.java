package com.zestigo.dto;

public class UserDto {
    private String id;
    private String name;
    private String email;
    private String phone;
    private String avatar;
    private String role;

    public UserDto() {
    }

    public UserDto(String id, String name, String email, String phone, String avatar, String role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.avatar = avatar;
        this.role = role;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    // Builder
    public static UserDtoBuilder builder() {
        return new UserDtoBuilder();
    }

    public static class UserDtoBuilder {
        private String id;
        private String name;
        private String email;
        private String phone;
        private String avatar;
        private String role;

        public UserDtoBuilder id(String id) { this.id = id; return this; }
        public UserDtoBuilder name(String name) { this.name = name; return this; }
        public UserDtoBuilder email(String email) { this.email = email; return this; }
        public UserDtoBuilder phone(String phone) { this.phone = phone; return this; }
        public UserDtoBuilder avatar(String avatar) { this.avatar = avatar; return this; }
        public UserDtoBuilder role(String role) { this.role = role; return this; }

        public UserDto build() {
            return new UserDto(id, name, email, phone, avatar, role);
        }
    }
}
