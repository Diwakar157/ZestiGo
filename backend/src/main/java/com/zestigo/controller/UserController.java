package com.zestigo.controller;

import com.zestigo.dto.AddressDto;
import com.zestigo.dto.UserDto;
import com.zestigo.dto.ClerkSyncRequest;
import com.zestigo.service.UserService;
import com.zestigo.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final JwtTokenProvider tokenProvider;

    public UserController(UserService userService, JwtTokenProvider tokenProvider) {
        this.userService = userService;
        this.tokenProvider = tokenProvider;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getProfile(Principal principal) {
        UserDto user = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(user);
    }

    @GetMapping("/me/addresses")
    public ResponseEntity<List<AddressDto>> getAddresses(Principal principal) {
        List<AddressDto> addresses = userService.getUserAddresses(principal.getName());
        return ResponseEntity.ok(addresses);
    }

    @PostMapping("/me/addresses")
    public ResponseEntity<AddressDto> addAddress(Principal principal, @Valid @RequestBody AddressDto addressDto) {
        AddressDto savedAddress = userService.addAddress(principal.getName(), addressDto);
        return new ResponseEntity<>(savedAddress, HttpStatus.CREATED);
    }

    @DeleteMapping("/me/addresses/{id}")
    public ResponseEntity<Void> deleteAddress(Principal principal, @PathVariable("id") String id) {
        userService.deleteAddress(principal.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/me/addresses/{id}")
    public ResponseEntity<AddressDto> updateAddress(Principal principal, @PathVariable("id") String id, @Valid @RequestBody AddressDto addressDto) {
        AddressDto updatedAddress = userService.updateAddress(principal.getName(), id, addressDto);
        return ResponseEntity.ok(updatedAddress);
    }

    @PostMapping("/clerk-sync")
    public ResponseEntity<UserDto> clerkSync(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody ClerkSyncRequest syncRequest) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        String token = authHeader.substring(7);
        if (!tokenProvider.validateToken(token)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        String tokenClerkId = tokenProvider.getUsernameFromToken(token);
        if (!tokenClerkId.equals(syncRequest.getClerkId())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        UserDto syncedUser = userService.syncClerkUser(syncRequest);
        return ResponseEntity.ok(syncedUser);
    }
}
