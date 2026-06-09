package com.zestigo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/content")
public class ContentController {

    @GetMapping("/testimonials")
    public ResponseEntity<List<Map<String, String>>> getTestimonials() {
        List<Map<String, String>> testimonials = Arrays.asList(
            Map.of(
                "name", "Aarav S.",
                "text", "Meghana's chicken biryani in 30 minutes, piping hot. Zestigo never disappoints!",
                "role", "Bengaluru"
            ),
            Map.of(
                "name", "Sneha M.",
                "text", "Love the festival offers and how easy it is to reorder my favourite dosa and filter coffee.",
                "role", "Mumbai"
            ),
            Map.of(
                "name", "Rohan K.",
                "text", "Fast, fresh and desi. The wishlist keeps all my go-to biryani spots in one place.",
                "role", "Delhi"
            )
        );
        return ResponseEntity.ok(testimonials);
    }

    @GetMapping("/faqs")
    public ResponseEntity<List<Map<String, String>>> getFaqs() {
        List<Map<String, String>> faqs = Arrays.asList(
            Map.of(
                "q", "How do I track my order?",
                "a", "Open the Orders page to see a live status timeline from kitchen to your doorstep."
            ),
            Map.of(
                "q", "How do I apply a coupon?",
                "a", "Enter your coupon code in the cart summary and tap Apply before checking out."
            ),
            Map.of(
                "q", "What payment methods are supported?",
                "a", "We accept credit/debit cards, the Zestigo Wallet, and cash on delivery."
            ),
            Map.of(
                "q", "Can I save my favorite restaurants?",
                "a", "Yes! Tap the heart icon on any restaurant or dish to add it to your wishlist."
            )
        );
        return ResponseEntity.ok(faqs);
    }
}
