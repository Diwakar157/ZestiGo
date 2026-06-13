package com.zestigo;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zestigo.dto.AddressDto;
import com.zestigo.entity.AuthProvider;
import com.zestigo.entity.Role;
import com.zestigo.entity.User;
import com.zestigo.repository.AddressRepository;
import com.zestigo.repository.UserRepository;
import com.zestigo.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class AddressIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;
    private String authToken;

    @BeforeEach
    public void setup() {
        testUser = User.builder()
                .id(UUID.randomUUID().toString())
                .name("Diwakar Test")
                .email("diwakar.test@zestigo.com")
                .password("password123")
                .phone("919876543210")
                .avatar("avatar_url")
                .role(Role.ROLE_USER)
                .provider(AuthProvider.LOCAL)
                .build();
        userRepository.save(testUser);

        authToken = "Bearer " + jwtTokenProvider.generateToken(testUser.getEmail());
    }

    @Test
    public void testAddressSaveAndValidationFlow() throws Exception {
        System.out.println("====== STARTING ADDRESS REST ENDPOINT VERIFICATION ======");

        // 1. Create request payload with all geocoding coordinates and fields
        AddressDto savePayload = AddressDto.builder()
                .label("REVA University")
                .line("Kattigenahalli, Yelahanka, Bengaluru")
                .isDefault(true)
                .latitude(13.1158)
                .longitude(77.6346)
                .placeId("node_1234567")
                .build();

        String payloadJson = objectMapper.writeValueAsString(savePayload);

        // 2. Perform POST to save address and confirm it returns 201 Created
        MvcResult postResult = mockMvc.perform(post("/api/users/me/addresses")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadJson))
                .andExpect(status().isCreated())
                .andReturn();

        AddressDto createdAddress = objectMapper.readValue(postResult.getResponse().getContentAsString(), AddressDto.class);
        assertNotNull(createdAddress.getId());
        assertEquals("REVA University", createdAddress.getLabel());
        assertEquals("Kattigenahalli, Yelahanka, Bengaluru", createdAddress.getLine());
        assertTrue(createdAddress.isDefault());
        assertEquals(13.1158, createdAddress.getLatitude());
        assertEquals(77.6346, createdAddress.getLongitude());
        assertEquals("node_1234567", createdAddress.getPlaceId());

        System.out.println("Test Case 1 Passed: POST /api/users/me/addresses returned 201 Created and saved latitude, longitude, and placeId.");

        // 3. Verify validation fails (400 Bad Request) when label is blank/empty
        AddressDto invalidPayload = AddressDto.builder()
                .label("") // Blank label (invalid)
                .line("Prestige Tech Park, Marathahalli")
                .isDefault(false)
                .latitude(12.9348)
                .longitude(77.6915)
                .placeId("way_7654321")
                .build();

        mockMvc.perform(post("/api/users/me/addresses")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidPayload)))
                .andExpect(status().isBadRequest());

        System.out.println("Test Case 2 Passed: Blank label was rejected with 400 Bad Request.");

        // 4. Retrieve saved addresses via GET and verify coordinate properties
        MvcResult getResult = mockMvc.perform(get("/api/users/me/addresses")
                        .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andReturn();

        List<AddressDto> addressList = objectMapper.readValue(
                getResult.getResponse().getContentAsString(),
                objectMapper.getTypeFactory().constructCollectionType(List.class, AddressDto.class)
        );

        assertEquals(1, addressList.size());
        AddressDto fetched = addressList.get(0);
        assertEquals(createdAddress.getId(), fetched.getId());
        assertEquals(13.1158, fetched.getLatitude());
        assertEquals(77.6346, fetched.getLongitude());
        assertEquals("node_1234567", fetched.getPlaceId());

        System.out.println("Test Case 3 Passed: GET /api/users/me/addresses successfully retrieved the new address with coordinates.");
        System.out.println("=========================================================");
    }
}
