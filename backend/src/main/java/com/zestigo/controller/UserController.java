package com.zestigo.controller;

import com.zestigo.dto.AddressDto;
import com.zestigo.dto.UserDto;
import com.zestigo.service.UserService;
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

    public UserController(UserService userService) {
        this.userService = userService;
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
}
