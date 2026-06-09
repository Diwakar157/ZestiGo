package com.zestigo.service;

import com.zestigo.dto.WishlistResponse;
import com.zestigo.dto.WishlistToggleRequest;
import com.zestigo.entity.User;
import com.zestigo.entity.Wishlist;
import com.zestigo.exception.ResourceNotFoundException;
import com.zestigo.repository.UserRepository;
import com.zestigo.repository.WishlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;

    public WishlistService(WishlistRepository wishlistRepository, UserRepository userRepository) {
        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public WishlistResponse getWishlist(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Wishlist> items = wishlistRepository.findByUserId(user.getId());

        List<String> restaurants = items.stream()
                .filter(item -> "restaurants".equalsIgnoreCase(item.getType()))
                .map(Wishlist::getItemId)
                .collect(Collectors.toList());

        List<String> foods = items.stream()
                .filter(item -> "foods".equalsIgnoreCase(item.getType()))
                .map(Wishlist::getItemId)
                .collect(Collectors.toList());

        return new WishlistResponse(restaurants, foods);
    }

    public WishlistResponse toggleWishlist(String email, WishlistToggleRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String type = request.getKind().toLowerCase();

        Optional<Wishlist> existing = wishlistRepository.findByUserIdAndItemIdAndType(
                user.getId(), request.getId(), type);

        if (existing.isPresent()) {
            wishlistRepository.delete(existing.get());
        } else {
            Wishlist wishlist = Wishlist.builder()
                    .id(UUID.randomUUID().toString())
                    .user(user)
                    .itemId(request.getId())
                    .type(type)
                    .build();
            wishlistRepository.save(wishlist);
        }

        return getWishlist(email);
    }
}
