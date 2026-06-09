package com.zestigo.service;

import com.zestigo.dto.AuthResponse;
import com.zestigo.dto.LoginRequest;
import com.zestigo.dto.UserDto;
import com.zestigo.entity.User;
import com.zestigo.exception.BadRequestException;
import com.zestigo.mapper.UserMapper;
import com.zestigo.repository.UserRepository;
import com.zestigo.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository, JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = tokenProvider.generateToken(request.getEmail());

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new BadRequestException("User not found"));
            UserDto userDto = UserMapper.toDto(user);

            return new AuthResponse(userDto, token);
        } catch (Exception e) {
            throw new BadRequestException("Invalid email or password");
        }
    }
}
