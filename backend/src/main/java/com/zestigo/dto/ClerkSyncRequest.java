package com.zestigo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ClerkSyncRequest {

    @NotBlank(message = "Clerk ID is required")
    private String clerkId;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String phone;
    private String avatar;

    public ClerkSyncRequest() {
    }

    public ClerkSyncRequest(String clerkId, String name, String email, String phone, String avatar) {
        this.clerkId = clerkId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.avatar = avatar;
    }

    // Getters and Setters
    public String getClerkId() { return clerkId; }
    public void setClerkId(String clerkId) { this.clerkId = clerkId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
}
