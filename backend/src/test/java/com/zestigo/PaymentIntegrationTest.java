package com.zestigo;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zestigo.dto.*;
import com.zestigo.entity.*;
import com.zestigo.repository.*;
import com.zestigo.security.JwtTokenProvider;
import com.zestigo.service.CartService;
import com.zestigo.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class PaymentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    private User testUserA;
    private User testUserB;
    private Restaurant testRestaurant;
    private FoodItem testFoodItem;
    private String tokenA;
    private String tokenB;

    @BeforeEach
    public void setup() throws Exception {
        // Setup mock RazorpayClient in PaymentService
        com.razorpay.RazorpayClient mockRzpClient = Mockito.mock(com.razorpay.RazorpayClient.class);
        mockRzpClient.orders = Mockito.mock(com.razorpay.OrderClient.class);
        ReflectionTestUtils.setField(paymentService, "razorpayClient", mockRzpClient);

        // Create Test Users
        testUserA = User.builder()
                .id(UUID.randomUUID().toString())
                .name("Aarav A")
                .email("aarav.a@zestigo.com")
                .password("password123")
                .phone("919999999999")
                .avatar("avatar_a")
                .role(Role.ROLE_USER)
                .provider(AuthProvider.LOCAL)
                .build();
        userRepository.save(testUserA);

        testUserB = User.builder()
                .id(UUID.randomUUID().toString())
                .name("Kabir B")
                .email("kabir.b@zestigo.com")
                .password("password123")
                .phone("918888888888")
                .avatar("avatar_b")
                .role(Role.ROLE_USER)
                .provider(AuthProvider.LOCAL)
                .build();
        userRepository.save(testUserB);

        // Generate Valid JWTs
        tokenA = "Bearer " + jwtTokenProvider.generateToken(testUserA.getEmail());
        tokenB = "Bearer " + jwtTokenProvider.generateToken(testUserB.getEmail());

        // Create Test Restaurant
        testRestaurant = Restaurant.builder()
                .id(UUID.randomUUID().toString())
                .name("Zestigo Premium Kitchen")
                .cuisine("North Indian")
                .rating(new BigDecimal("4.8"))
                .reviewsCount(120)
                .deliveryTime(30)
                .deliveryFee(new BigDecimal("40.00"))
                .distance(new BigDecimal("1.5"))
                .priceRange("₹₹")
                .address("100, Outer Ring Road, Bengaluru")
                .promoted(true)
                .build();
        restaurantRepository.save(testRestaurant);

        // Create Test Food Item
        testFoodItem = FoodItem.builder()
                .id(UUID.randomUUID().toString())
                .restaurant(testRestaurant)
                .name("Paneer Butter Masala")
                .description("Rich creamy gravy with fresh cottage cheese paneer blocks")
                .price(new BigDecimal("350.00"))
                .imageUrl("paneer_img")
                .category("Main Course")
                .rating(new BigDecimal("4.7"))
                .reviewsCount(50)
                .popular(true)
                .veg(true)
                .build();
        foodItemRepository.save(testFoodItem);
    }

    // Helper to calculate Razorpay Signature natively
    private String calculateSignature(String orderId, String paymentId, String secret) throws Exception {
        String data = orderId + "|" + paymentId;
        Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secret_key = new SecretKeySpec(secret.getBytes("UTF-8"), "HmacSHA256");
        sha256_HMAC.init(secret_key);
        byte[] hash = sha256_HMAC.doFinal(data.getBytes("UTF-8"));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }

    @Test
    public void testFullRazorpayFlow() throws Exception {
        System.out.println("====== STARTING RAZORPAY VERIFICATION TESTS ======");

        // --- TEST CASE 1: Successful Payment ---
        System.out.println("Running Test Case 1: Successful Payment Flow");

        // 1. Add food item to user's cart
        cartService.addItemToCart(testUserA.getEmail(), new CartRequest(testFoodItem.getId(), 2));
        assertFalse(cartService.getCartItems(testUserA.getEmail()).isEmpty());

        // 2. Create the order
        Order order = Order.builder()
                .id("ORD-TEST-1234")
                .user(testUserA)
                .restaurant(testRestaurant)
                .restaurantName(testRestaurant.getName())
                .totalAmount(new BigDecimal("740.00")) // (350 * 2) + 40 delivery
                .status(OrderStatus.PENDING_PAYMENT)
                .address("12, Koramangala, Bengaluru")
                .items(new ArrayList<>())
                .build();

        OrderItem orderItem = OrderItem.builder()
                .id(UUID.randomUUID().toString())
                .order(order)
                .foodItem(testFoodItem)
                .quantity(2)
                .priceAtPurchase(testFoodItem.getPrice())
                .build();
        order.getItems().add(orderItem);

        orderRepository.save(order);

        Payment payment = Payment.builder()
                .id(UUID.randomUUID().toString())
                .order(order)
                .paymentMethod(PaymentMethod.CARD)
                .paymentStatus(PaymentStatus.PENDING)
                .amount(order.getTotalAmount())
                .currency("INR")
                .build();
        paymentRepository.save(payment);
        order.setPayment(payment);
        orderRepository.save(order);

        // Mock Razorpay SDK response
        com.razorpay.RazorpayClient mockRzpClient = (com.razorpay.RazorpayClient) ReflectionTestUtils.getField(paymentService, "razorpayClient");
        com.razorpay.Order mockRzpOrder = Mockito.mock(com.razorpay.Order.class);
        Mockito.when(mockRzpOrder.get("id")).thenReturn("order_rzp_mock123");
        Mockito.when(mockRzpClient.orders.create(Mockito.any(org.json.JSONObject.class))).thenReturn(mockRzpOrder);

        // 3. Initiate payment order
        CreatePaymentOrderRequest createReq = new CreatePaymentOrderRequest(order.getId());
        String createJson = objectMapper.writeValueAsString(createReq);

        MvcResult createResult = mockMvc.perform(post("/api/payments/create-order")
                        .header("Authorization", tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson))
                .andExpect(status().isOk())
                .andReturn();

        CreatePaymentOrderResponse createResp = objectMapper.readValue(createResult.getResponse().getContentAsString(), CreatePaymentOrderResponse.class);
        assertEquals("order_rzp_mock123", createResp.getRazorpayOrderId());
        assertEquals(74000, createResp.getAmount()); // 740 * 100 paise

        // Verify DB contains payment in PENDING with Razorpay Order ID
        Payment savedPayment = paymentRepository.findByRazorpayOrderId("order_rzp_mock123")
                .orElseThrow(() -> new AssertionError("Payment record not found in database"));
        assertEquals(PaymentStatus.PENDING, savedPayment.getPaymentStatus());
        assertEquals("order_rzp_mock123", savedPayment.getRazorpayOrderId());

        // 4. Verify payment with valid signature
        String mockPaymentId = "pay_rzp_mock999";
        String mockSignature = calculateSignature("order_rzp_mock123", mockPaymentId, keySecret);

        VerifyPaymentRequest verifyReq = new VerifyPaymentRequest("order_rzp_mock123", mockPaymentId, mockSignature);
        String verifyJson = objectMapper.writeValueAsString(verifyReq);

        MvcResult verifyResult = mockMvc.perform(post("/api/payments/verify")
                        .header("Authorization", tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(verifyJson))
                .andExpect(status().isOk())
                .andReturn();

        PaymentDto verifiedPayment = objectMapper.readValue(verifyResult.getResponse().getContentAsString(), PaymentDto.class);
        assertEquals("SUCCESS", verifiedPayment.getPaymentStatus().name());
        assertEquals(mockPaymentId, verifiedPayment.getRazorpayPaymentId());

        // Verify DB reflects SUCCESS, Order Status is placed, and cart is cleared
        Payment finalPayment = paymentRepository.findById(savedPayment.getId()).orElse(null);
        assertNotNull(finalPayment);
        assertEquals(PaymentStatus.SUCCESS, finalPayment.getPaymentStatus());
        assertEquals(OrderStatus.CONFIRMED, finalPayment.getOrder().getStatus());
        assertTrue(cartService.getCartItems(testUserA.getEmail()).isEmpty(), "Cart should be cleared after successful verification");

        System.out.println("Test Case 1 Passed: Payment SUCCESS, Order placed, Cart cleared, DB fields correct.");


        // --- TEST CASE 2 & 3: Payment Failure & User Modal Dismiss ---
        System.out.println("Running Test Case 2 & 3: Failure & Cancel Flows");

        Order failOrder = Order.builder()
                .id("ORD-TEST-FAIL")
                .user(testUserA)
                .restaurant(testRestaurant)
                .restaurantName(testRestaurant.getName())
                .totalAmount(new BigDecimal("350.00"))
                .status(OrderStatus.PENDING_PAYMENT)
                .address("12, Koramangala, Bengaluru")
                .items(new ArrayList<>())
                .build();
        orderRepository.save(failOrder);

        Payment failPayment = Payment.builder()
                .id(UUID.randomUUID().toString())
                .order(failOrder)
                .paymentMethod(PaymentMethod.CARD)
                .paymentStatus(PaymentStatus.PENDING)
                .amount(failOrder.getTotalAmount())
                .currency("INR")
                .build();
        paymentRepository.save(failPayment);
        failOrder.setPayment(failPayment);
        orderRepository.save(failOrder);

        // Initiate payment order to get new mock Razorpay Order
        com.razorpay.Order mockRzpOrderFail = Mockito.mock(com.razorpay.Order.class);
        Mockito.when(mockRzpOrderFail.get("id")).thenReturn("order_rzp_fail456");
        Mockito.when(mockRzpClient.orders.create(Mockito.any(org.json.JSONObject.class))).thenReturn(mockRzpOrderFail);

        mockMvc.perform(post("/api/payments/create-order")
                        .header("Authorization", tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreatePaymentOrderRequest(failOrder.getId()))))
                .andExpect(status().isOk());

        // Report failure / dismiss modal
        PaymentFailureRequest failReq = new PaymentFailureRequest("order_rzp_fail456", "Payment cancelled by user");
        mockMvc.perform(post("/api/payments/failure")
                        .header("Authorization", tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(failReq)))
                .andExpect(status().isOk());

        // Verify DB reflects FAILED, cart remains intact (if items were present)
        Payment updatedFailPayment = paymentRepository.findByRazorpayOrderId("order_rzp_fail456").orElse(null);
        assertNotNull(updatedFailPayment);
        assertEquals(PaymentStatus.FAILED, updatedFailPayment.getPaymentStatus());

        System.out.println("Test Case 2 & 3 Passed: Payment is recorded as FAILED on cancellations.");


        // --- TEST CASE 4: Duplicate Verification Test ---
        System.out.println("Running Test Case 4: Duplicate Verification Prevention");

        // Verify the successful order again
        mockMvc.perform(post("/api/payments/verify")
                        .header("Authorization", tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(verifyJson))
                .andExpect(status().isOk()); // Returns 200 without throwing errors or creating duplicates

        // Double check no new payment was created for same Razorpay Order ID
        List<Payment> dupCheck = paymentRepository.findByOrderUserIdOrderByCreatedAtDesc(testUserA.getId());
        long count = dupCheck.stream().filter(p -> "order_rzp_mock123".equals(p.getRazorpayOrderId())).count();
        assertEquals(1, count, "There should be exactly one payment record for the Razorpay order");

        System.out.println("Test Case 4 Passed: Duplicate verification blocked correctly.");


        // --- TEST CASE 5: Unauthorized Access Test ---
        System.out.println("Running Test Case 5: Unauthorized Access Blocking");

        // User B attempts to verify User A's payment
        mockMvc.perform(post("/api/payments/verify")
                        .header("Authorization", tokenB) // authenticated as User B
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(verifyJson))
                .andExpect(status().isBadRequest()); // Blocked: Bad Request / Unauthorized ownership

        System.out.println("Test Case 5 Passed: Unauthorized verification blocked correctly.");


        // --- TEST CASE 6: Payment History Test ---
        System.out.println("Running Test Case 6: Payment History check");

        MvcResult historyResult = mockMvc.perform(get("/api/payments/history")
                        .header("Authorization", tokenA))
                .andExpect(status().isOk())
                .andReturn();

        List<PaymentDto> history = objectMapper.readValue(
                historyResult.getResponse().getContentAsString(),
                objectMapper.getTypeFactory().constructCollectionType(List.class, PaymentDto.class)
        );

        assertTrue(history.size() >= 2);
        boolean hasSuccess = history.stream().anyMatch(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS);
        boolean hasFailed = history.stream().anyMatch(p -> p.getPaymentStatus() == PaymentStatus.FAILED);
        assertTrue(hasSuccess, "History must contain the successful transaction");
        assertTrue(hasFailed, "History must contain the failed transaction");

        System.out.println("Test Case 6 Passed: Payment history loaded successfully.");


        // --- TEST CASE 7: Database Row Printing ---
        System.out.println("\n--- TEST CASE 7: DATABASE ROWS DEMO ---");
        System.out.println("Orders Table:");
        orderRepository.findByUserIdOrderByCreatedAtDesc(testUserA.getId()).forEach(o -> {
            System.out.printf("  Order ID: %s | Total: %s | Status: %s\n", o.getId(), o.getTotalAmount(), o.getStatus());
        });

        System.out.println("Payments Table:");
        paymentRepository.findByOrderUserIdOrderByCreatedAtDesc(testUserA.getId()).forEach(p -> {
            System.out.printf("  Payment ID: %s | Order ID: %s | RzpOrder ID: %s | RzpPay ID: %s | Status: %s | Amount: %s\n",
                    p.getId(), p.getOrder().getId(), p.getRazorpayOrderId(), p.getRazorpayPaymentId(), p.getPaymentStatus(), p.getAmount());
        });
        System.out.println("=========================================================");
    }

    @Test
    public void testWebhookFlow() throws Exception {
        System.out.println("====== STARTING RAZORPAY WEBHOOK TESTS ======");

        // Setup mock user B with cart items
        cartService.addItemToCart(testUserB.getEmail(), new CartRequest(testFoodItem.getId(), 1));
        assertFalse(cartService.getCartItems(testUserB.getEmail()).isEmpty());

        // Create test order for webhook
        Order order = Order.builder()
                .id("ORD-TEST-WEBHOOK")
                .user(testUserB)
                .restaurant(testRestaurant)
                .restaurantName(testRestaurant.getName())
                .totalAmount(new BigDecimal("390.00"))
                .status(OrderStatus.PENDING_PAYMENT)
                .address("12, Work, Bengaluru")
                .items(new ArrayList<>())
                .build();

        OrderItem orderItem = OrderItem.builder()
                .id(UUID.randomUUID().toString())
                .order(order)
                .foodItem(testFoodItem)
                .quantity(1)
                .priceAtPurchase(testFoodItem.getPrice())
                .build();
        order.getItems().add(orderItem);
        orderRepository.save(order);

        Payment payment = Payment.builder()
                .id(UUID.randomUUID().toString())
                .order(order)
                .razorpayOrderId("order_rzp_webhook789")
                .paymentMethod(PaymentMethod.CARD)
                .paymentStatus(PaymentStatus.PENDING)
                .amount(order.getTotalAmount())
                .currency("INR")
                .build();
        paymentRepository.save(payment);
        order.setPayment(payment);
        orderRepository.save(order);

        // Fetch configured webhookSecret to calculate valid signature
        String webhookSecret = (String) org.springframework.test.util.ReflectionTestUtils.getField(paymentService, "webhookSecret");

        // Construct mock webhook payload
        String webhookPayload = "{"
                + "\"entity\":\"event\","
                + "\"account_id\":\"acc_mock123\","
                + "\"event\":\"order.paid\","
                + "\"contains\":[\"order\",\"payment\"],"
                + "\"payload\":{"
                + "  \"order\":{"
                + "    \"entity\":{"
                + "      \"id\":\"order_rzp_webhook789\","
                + "      \"amount\":39000,"
                + "      \"currency\":\"INR\","
                + "      \"receipt\":\"ORD-TEST-WEBHOOK\","
                + "      \"status\":\"paid\""
                + "    }"
                + "  },"
                + "  \"payment\":{"
                + "    \"entity\":{"
                + "      \"id\":\"pay_rzp_webhook789\","
                + "      \"amount\":39000,"
                + "      \"currency\":\"INR\","
                + "      \"order_id\":\"order_rzp_webhook789\""
                + "    }"
                + "  }"
                + "}"
                + "}";

        // Calculate HMAC SHA256 of payload using webhookSecret
        Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secret_key = new SecretKeySpec(webhookSecret.getBytes("UTF-8"), "HmacSHA256");
        sha256_HMAC.init(secret_key);
        byte[] hash = sha256_HMAC.doFinal(webhookPayload.getBytes("UTF-8"));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        String validSignature = hexString.toString();

        // 1. Post to webhook endpoint
        mockMvc.perform(post("/api/payments/webhook")
                        .header("X-Razorpay-Signature", validSignature)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(webhookPayload))
                .andExpect(status().isOk());

        // 2. Verify payment status is SUCCESS, order is placed, and cart is cleared
        Payment finalPayment = paymentRepository.findByRazorpayOrderId("order_rzp_webhook789").orElse(null);
        assertNotNull(finalPayment);
        assertEquals(PaymentStatus.SUCCESS, finalPayment.getPaymentStatus());
        assertEquals("pay_rzp_webhook789", finalPayment.getRazorpayPaymentId());
        assertEquals(OrderStatus.CONFIRMED, finalPayment.getOrder().getStatus());
        assertTrue(cartService.getCartItems(testUserB.getEmail()).isEmpty(), "Cart should be cleared after successful webhook verification");

        // 3. Test signature validation failure
        mockMvc.perform(post("/api/payments/webhook")
                        .header("X-Razorpay-Signature", "invalid_signature_here")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(webhookPayload))
                .andExpect(status().isBadRequest()); // Bad request due to invalid signature

        System.out.println("Webhook verification test passed successfully!");
    }
}
