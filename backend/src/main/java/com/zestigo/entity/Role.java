package com.zestigo.entity;

/**
 * Strongly-typed role enum for Spring Security authority mapping.
 *
 * Values are stored as their name() string in the database column
 * (EnumType.STRING), meaning they appear as "ROLE_USER", "ROLE_ADMIN",
 * "ROLE_DELIVERY" — directly usable as Spring Security GrantedAuthority names.
 */
public enum Role {

    ROLE_USER,
    ROLE_ADMIN,
    ROLE_DELIVERY;

    /**
     * Returns the role name as a Spring Security authority string.
     * Equivalent to name() but explicit for clarity in security contexts.
     */
    public String getAuthority() {
        return this.name();
    }
}
