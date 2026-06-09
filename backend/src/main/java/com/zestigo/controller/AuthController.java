package com.zestigo.controller;

import com.zestigo.dto.AuthResponse;
import com.zestigo.dto.LoginRequest;
import com.zestigo.dto.RegisterRequest;
import com.zestigo.dto.UserDto;
import com.zestigo.service.AuthService;
import com.zestigo.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AuthController.class);

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("AuthController: Received registration request payload: name='{}', email='{}', phone='{}'", request.getName(), request.getEmail(), request.getPhone());
        log.info("AuthController: Validation passed. Calling userService.registerUser...");
        UserDto user = userService.registerUser(request);
        log.info("AuthController: UserService successfully registered user: {}", user);
        
        log.info("AuthController: Initiating automatic login for email: '{}'", request.getEmail());
        LoginRequest loginRequest = new LoginRequest(request.getEmail(), request.getPassword());
        AuthResponse response = authService.login(loginRequest);
        log.info("AuthController: Automatic login succeeded. Returning response.");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // Stateless JWT - client discards the token. Just return OK.
        return ResponseEntity.ok().build();
    }
}
