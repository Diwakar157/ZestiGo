package com.zestigo.security;

import com.zestigo.entity.AuthProvider;
import com.zestigo.entity.Role;
import com.zestigo.entity.User;
import com.zestigo.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.UUID;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;

    public OAuth2SuccessHandler(UserRepository userRepository, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.tokenProvider = tokenProvider;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String avatar = oAuth2User.getAttribute("picture");
        String googleId = oAuth2User.getAttribute("sub");

        if (email == null) {
            response.sendRedirect("http://localhost:8080/login?error=Email not provided by Google");
            return;
        }

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // Register a new user automatically
            user = User.builder()
                    .id(UUID.randomUUID().toString())
                    .name(name != null ? name : "Google User")
                    .email(email)
                    .avatar(avatar != null ? avatar : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80&auto=format&fit=crop")
                    .role(Role.ROLE_USER)
                    .provider(AuthProvider.GOOGLE)
                    .providerId(googleId)
                    .build();
            userRepository.save(user);
        } else {
            // Link provider if not set
            if (user.getProvider() == null) {
                user.setProvider(AuthProvider.LOCAL);
            }
            if (user.getProviderId() == null && googleId != null) {
                user.setProviderId(googleId);
                userRepository.save(user);
            }
        }

        String token = tokenProvider.generateToken(email);

        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:8080/oauth2/redirect")
                .queryParam("token", token)
                .queryParam("id", user.getId())
                .queryParam("name", user.getName())
                .queryParam("email", user.getEmail())
                .queryParam("avatar", user.getAvatar())
                .queryParam("phone", user.getPhone() != null ? user.getPhone() : "")
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
