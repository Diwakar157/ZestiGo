package com.zestigo.service;

import com.zestigo.dto.CartItemDto;
import com.zestigo.dto.CartRequest;
import com.zestigo.entity.Cart;
import com.zestigo.entity.CartItem;
import com.zestigo.entity.FoodItem;
import com.zestigo.entity.User;
import com.zestigo.exception.ResourceNotFoundException;
import com.zestigo.mapper.CartMapper;
import com.zestigo.repository.CartItemRepository;
import com.zestigo.repository.CartRepository;
import com.zestigo.repository.FoodItemRepository;
import com.zestigo.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartService {

    private static final Logger log = LoggerFactory.getLogger(CartService.class);

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final FoodItemRepository foodItemRepository;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository,
                       UserRepository userRepository, FoodItemRepository foodItemRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.foodItemRepository = foodItemRepository;
    }

    private Cart getOrCreateCart(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart cart = Cart.builder()
                            .id(UUID.randomUUID().toString())
                            .user(user)
                            .items(new ArrayList<>())
                            .build();
                    return cartRepository.save(cart);
                });
    }

    @Transactional(readOnly = true)
    public List<CartItemDto> getCartItems(String email) {
        Cart cart = getOrCreateCart(email);
        return cart.getItems().stream()
                .map(CartMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<CartItemDto> addItemToCart(String email, CartRequest request) {
        log.info("Authenticated user: {}", email);
        Cart cart = getOrCreateCart(email);
        FoodItem foodItem = foodItemRepository.findById(request.getFoodItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found"));
        log.info("Food item found: {}", foodItem.getId());

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndFoodItemId(cart.getId(), foodItem.getId());

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = CartItem.builder()
                    .id(UUID.randomUUID().toString())
                    .cart(cart)
                    .foodItem(foodItem)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(newItem);
            cart.getItems().add(newItem);
        }

        cartRepository.save(cart);
        return getCartItems(email);
    }

    public List<CartItemDto> updateItemQuantity(String email, String foodItemId, Integer quantity) {
        Cart cart = getOrCreateCart(email);

        CartItem item = cartItemRepository.findByCartIdAndFoodItemId(cart.getId(), foodItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in cart"));

        if (quantity <= 0) {
            cartItemRepository.delete(item);
            cart.getItems().remove(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        cartRepository.save(cart);
        return getCartItems(email);
    }

    public List<CartItemDto> removeItemFromCart(String email, String foodItemId) {
        Cart cart = getOrCreateCart(email);

        CartItem item = cartItemRepository.findByCartIdAndFoodItemId(cart.getId(), foodItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in cart"));

        cartItemRepository.delete(item);
        cart.getItems().remove(item);
        cartRepository.save(cart);

        return getCartItems(email);
    }

    public void clearCart(String email) {
        Cart cart = getOrCreateCart(email);
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cartRepository.save(cart);
    }
}
