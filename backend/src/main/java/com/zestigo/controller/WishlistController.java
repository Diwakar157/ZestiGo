package com.zestigo.controller;

import com.zestigo.dto.WishlistResponse;
import com.zestigo.dto.WishlistToggleRequest;
import com.zestigo.service.WishlistService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<WishlistResponse> getWishlist(Principal principal) {
        WishlistResponse response = wishlistService.getWishlist(principal.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/toggle")
    public ResponseEntity<WishlistResponse> toggleWishlist(
            Principal principal,
            @Valid @RequestBody WishlistToggleRequest request) {
        
        WishlistResponse response = wishlistService.toggleWishlist(principal.getName(), request);
        return ResponseEntity.ok(response);
    }
}
