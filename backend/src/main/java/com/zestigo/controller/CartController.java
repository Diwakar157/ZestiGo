package com.zestigo.controller;

import com.zestigo.dto.CartItemDto;
import com.zestigo.dto.CartRequest;
import com.zestigo.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<List<CartItemDto>> getCart(Principal principal) {
        List<CartItemDto> cart = cartService.getCartItems(principal.getName());
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/items")
    public ResponseEntity<List<CartItemDto>> addItem(Principal principal, @Valid @RequestBody CartRequest request) {
        List<CartItemDto> cart = cartService.addItemToCart(principal.getName(), request);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/items/{foodItemId}")
    public ResponseEntity<List<CartItemDto>> updateQuantity(
            Principal principal,
            @PathVariable("foodItemId") String foodItemId,
            @RequestParam("quantity") Integer quantity) {
        
        List<CartItemDto> cart = cartService.updateItemQuantity(principal.getName(), foodItemId, quantity);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/items/{foodItemId}")
    public ResponseEntity<List<CartItemDto>> removeItem(Principal principal, @PathVariable("foodItemId") String foodItemId) {
        List<CartItemDto> cart = cartService.removeItemFromCart(principal.getName(), foodItemId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(Principal principal) {
        cartService.clearCart(principal.getName());
        return ResponseEntity.noContent().build();
    }
}
