package com.zestigo.dto;

public class AuthResponse {
    private UserDto user;
    private String token;

    public AuthResponse() {
    }

    public AuthResponse(UserDto user, String token) {
        this.user = user;
        this.token = token;
    }

    // Getters and Setters
    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    // Builder
    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public static class AuthResponseBuilder {
        private UserDto user;
        private String token;

        public AuthResponseBuilder user(UserDto user) { this.user = user; return this; }
        public AuthResponseBuilder token(String token) { this.token = token; return this; }

        public AuthResponse build() {
            return new AuthResponse(user, token);
        }
    }
}
