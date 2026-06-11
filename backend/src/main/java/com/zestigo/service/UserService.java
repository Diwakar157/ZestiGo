package com.zestigo.service;

import com.zestigo.dto.AddressDto;
import com.zestigo.dto.RegisterRequest;
import com.zestigo.dto.UserDto;
import com.zestigo.entity.Address;
import com.zestigo.entity.Role;
import com.zestigo.entity.User;
import com.zestigo.exception.BadRequestException;
import com.zestigo.exception.ResourceNotFoundException;
import com.zestigo.mapper.AddressMapper;
import com.zestigo.mapper.UserMapper;
import com.zestigo.repository.AddressRepository;
import com.zestigo.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, AddressRepository addressRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDto registerUser(RegisterRequest request) {
        log.info("UserService: Entering registerUser with email='{}'", request.getEmail());
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("UserService: Email already exists: '{}'", request.getEmail());
            throw new BadRequestException("Email already exists");
        }

        User user = User.builder()
                .id(UUID.randomUUID().toString())
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .avatar("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80&auto=format&fit=crop") // default avatar
                .role(Role.ROLE_USER)
                .build();

        log.info("UserService: Attempting to save user entity to database: {}", user);
        User savedUser = userRepository.save(user);
        log.info("UserService: Successfully saved user entity to database. ID: {}", savedUser.getId());
        return UserMapper.toDto(savedUser);
     }

    public UserDto syncClerkUser(com.zestigo.dto.ClerkSyncRequest request) {
        log.info("UserService: Entering syncClerkUser with clerkId='{}' and email='{}'", request.getClerkId(), request.getEmail());
        
        User user = userRepository.findById(request.getClerkId())
                .orElseGet(() -> userRepository.findByEmail(request.getEmail())
                        .map(existingUser -> {
                            log.info("UserService: Mapping local user with email '{}' to Clerk ID '{}'", request.getEmail(), request.getClerkId());
                            return existingUser;
                        })
                        .orElseGet(() -> {
                            log.info("UserService: Creating new user for Clerk ID '{}'", request.getClerkId());
                            User newUser = new User();
                            newUser.setId(request.getClerkId());
                            newUser.setRole(Role.ROLE_USER);
                            return newUser;
                        }));

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user.setPhone(request.getPhone());
        }
        if (request.getAvatar() != null && !request.getAvatar().isBlank()) {
            user.setAvatar(request.getAvatar());
        }
        user.setProvider(com.zestigo.entity.AuthProvider.CLERK);
        user.setProviderId(request.getClerkId());

        User savedUser = userRepository.save(user);
        log.info("UserService: Successfully synced Clerk user. Local ID: {}", savedUser.getId());
        return UserMapper.toDto(savedUser);
    }


    @Transactional(readOnly = true)
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return UserMapper.toDto(user);
    }

    @Transactional(readOnly = true)
    public List<AddressDto> getUserAddresses(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return addressRepository.findByUserId(user.getId()).stream()
                .map(AddressMapper::toDto)
                .collect(Collectors.toList());
    }

    public AddressDto addAddress(String email, AddressDto addressDto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Address> existing = addressRepository.findByUserId(user.getId());
        boolean isDefault = existing.isEmpty() || addressDto.isDefault();

        if (isDefault) {
            for (Address addr : existing) {
                if (addr.isDefault()) {
                    addr.setDefault(false);
                    addressRepository.save(addr);
                }
            }
        }

        Address address = Address.builder()
                .id(UUID.randomUUID().toString())
                .user(user)
                .label(addressDto.getLabel())
                .line(addressDto.getLine())
                .isDefault(isDefault)
                .build();

        Address savedAddress = addressRepository.save(address);
        return AddressMapper.toDto(savedAddress);
    }

    public void deleteAddress(String email, String addressId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorised access to delete address");
        }

        boolean wasDefault = address.isDefault();
        addressRepository.delete(address);

        if (wasDefault) {
            List<Address> remaining = addressRepository.findByUserId(user.getId()).stream()
                    .filter(a -> !a.getId().equals(addressId))
                    .collect(Collectors.toList());
            if (!remaining.isEmpty()) {
                Address newDefault = remaining.get(0);
                newDefault.setDefault(true);
                addressRepository.save(newDefault);
            }
        }
    }

    public AddressDto updateAddress(String email, String addressId, AddressDto addressDto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorised access to update address");
        }

        boolean makeDefault = addressDto.isDefault();
        if (makeDefault && !address.isDefault()) {
            List<Address> existing = addressRepository.findByUserId(user.getId());
            for (Address addr : existing) {
                if (!addr.getId().equals(addressId) && addr.isDefault()) {
                    addr.setDefault(false);
                    addressRepository.save(addr);
                }
            }
            address.setDefault(true);
        } else if (!makeDefault && address.isDefault()) {
            // Keep it default if it's the only one, or allow setting to false
            address.setDefault(false);
        }

        address.setLabel(addressDto.getLabel());
        address.setLine(addressDto.getLine());
        Address savedAddress = addressRepository.save(address);
        return AddressMapper.toDto(savedAddress);
    }
}
