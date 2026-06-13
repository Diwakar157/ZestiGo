package com.zestigo.service;

import com.razorpay.RazorpayClient;
import com.zestigo.dto.CreatePaymentOrderResponse;
import com.zestigo.dto.PaymentDto;
import com.zestigo.dto.PaymentFailureRequest;
import com.zestigo.dto.VerifyPaymentRequest;
import com.zestigo.entity.Order;
import com.zestigo.entity.OrderStatus;
import com.zestigo.entity.Payment;
import com.zestigo.entity.PaymentStatus;
import com.zestigo.entity.User;
import com.zestigo.exception.BadRequestException;
import com.zestigo.exception.ResourceNotFoundException;
import com.zestigo.mapper.PaymentMapper;
import com.zestigo.repository.OrderRepository;
import com.zestigo.repository.PaymentRepository;
import com.zestigo.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartService cartService;

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    @Value("${razorpay.webhook-secret:default_webhook_secret_123}")
    private String webhookSecret;

    private RazorpayClient razorpayClient;

    private final OrderService orderService;

    public PaymentService(PaymentRepository paymentRepository, OrderRepository orderRepository,
                          UserRepository userRepository, CartService cartService, OrderService orderService) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.cartService = cartService;
        this.orderService = orderService;
    }

    @PostConstruct
    public void init() {
        try {
            log.info("Initializing RazorpayClient with Key ID: {}", keyId);
            this.razorpayClient = new RazorpayClient(keyId, keySecret);
        } catch (Exception e) {
            log.error("Failed to initialize Razorpay Client: {}", e.getMessage(), e);
        }
    }

    public CreatePaymentOrderResponse createPaymentOrder(String email, String orderId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Verify order ownership
        if (!order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You do not have permission to pay for this order");
        }

        Payment payment = order.getPayment();
        if (payment == null) {
            throw new BadRequestException("Order does not have an associated payment record. Please create an order first.");
        }

        // Prevent duplicate successful payments
        if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
            throw new BadRequestException("This order is already successfully paid");
        }

        try {
            int amountInPaise = order.getTotalAmount().multiply(new BigDecimal(100)).intValue();

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", order.getId());

            log.info("Creating Razorpay Order for amount: {} paise, receipt: {}", amountInPaise, order.getId());
            com.razorpay.Order rzpOrder = razorpayClient.orders.create(orderRequest);

            String razorpayOrderId = rzpOrder.get("id");
            log.info("Razorpay Order created successfully. ID: {}", razorpayOrderId);

            payment.setRazorpayOrderId(razorpayOrderId);
            payment.setPaymentStatus(PaymentStatus.PENDING);
            
            // No need for explicit paymentRepository.save() —
            // Payment is managed via Order's CascadeType.ALL.
            // Hibernate dirty-checking will flush changes at transaction commit.

            return new CreatePaymentOrderResponse(
                    razorpayOrderId,
                    amountInPaise,
                    "INR",
                    keyId
            );
        } catch (Exception e) {
            log.error("Error creating Razorpay Order: {}", e.getMessage(), e);
            throw new BadRequestException("Failed to initiate Razorpay Order: " + e.getMessage());
        }
    }

    public PaymentDto verifyPayment(String email, VerifyPaymentRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for Razorpay Order ID: " + request.getRazorpayOrderId()));

        // Verify ownership
        if (!payment.getOrder().getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Payment verification unauthorized");
        }

        // Prevent duplicate verification
        if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
            log.info("Payment already successfully verified. Razorpay Order ID: {}", request.getRazorpayOrderId());
            return PaymentMapper.toDto(payment);
        }

        // Verify Razorpay signature using SDK utility method
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", request.getRazorpayOrderId());
            attributes.put("razorpay_payment_id", request.getRazorpayPaymentId());
            attributes.put("razorpay_signature", request.getRazorpaySignature());

            boolean isValid = com.razorpay.Utils.verifyPaymentSignature(attributes, keySecret);

            if (!isValid) {
                log.error("Signature verification failed for Order: {}, Payment: {}", request.getRazorpayOrderId(), request.getRazorpayPaymentId());
                payment.setPaymentStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
                throw new BadRequestException("Invalid payment signature");
            }

            log.info("Signature verification succeeded for Order: {}", request.getRazorpayOrderId());

            // Update Payment Entity
            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setRazorpaySignature(request.getRazorpaySignature());
            payment.setPaymentStatus(PaymentStatus.SUCCESS);
            payment.setTransactionTime(LocalDateTime.now());
            paymentRepository.save(payment);

            // Update Order Status to CONFIRMED
            Order order = payment.getOrder();
            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);

            // Trigger tracking simulator
            orderService.simulateOrderTracking(order.getId());

            // Clear cart upon successful payment verification
            cartService.clearCart(email);

            return PaymentMapper.toDto(payment);
        } catch (Exception e) {
            log.error("Exception during signature verification: {}", e.getMessage(), e);
            payment.setPaymentStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            if (e instanceof BadRequestException) {
                throw (BadRequestException) e;
            }
            throw new BadRequestException("Payment signature verification failed: " + e.getMessage());
        }
    }

    public PaymentDto failPayment(String email, PaymentFailureRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for Razorpay Order ID: " + request.getRazorpayOrderId()));

        // Verify ownership
        if (!payment.getOrder().getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Payment failure recording unauthorized");
        }

        log.info("Recording payment failure for Order ID: {}. Error message: {}", request.getRazorpayOrderId(), request.getErrorMessage());
        payment.setPaymentStatus(PaymentStatus.FAILED);
        paymentRepository.save(payment);

        return PaymentMapper.toDto(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentDto> getPaymentHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Payment> payments = paymentRepository.findByOrderUserIdOrderByCreatedAtDesc(user.getId());
        return payments.stream()
                .map(PaymentMapper::toDto)
                .collect(Collectors.toList());
    }

    public void processWebhook(String payload, String signature) {
        log.info("Received Razorpay webhook signature: {}", signature);
        try {
            boolean isValid = com.razorpay.Utils.verifyWebhookSignature(payload, signature, webhookSecret);
            if (!isValid) {
                log.error("Webhook signature verification failed");
                throw new BadRequestException("Invalid webhook signature");
            }
        } catch (Exception e) {
            log.error("Webhook signature verification exception: {}", e.getMessage(), e);
            throw new BadRequestException("Invalid webhook signature: " + e.getMessage());
        }

        try {
            org.json.JSONObject eventObj = new org.json.JSONObject(payload);
            String eventType = eventObj.optString("event");
            log.info("Processing webhook event: {}", eventType);

            if (!"payment.captured".equals(eventType) && !"order.paid".equals(eventType)) {
                log.info("Ignoring unhandled event type: {}", eventType);
                return;
            }

            org.json.JSONObject payloadObj = eventObj.getJSONObject("payload");
            String razorpayOrderId = null;
            String razorpayPaymentId = null;

            if ("order.paid".equals(eventType)) {
                org.json.JSONObject orderEntity = payloadObj.getJSONObject("order").getJSONObject("entity");
                razorpayOrderId = orderEntity.getString("id");
                
                if (payloadObj.has("payment")) {
                    org.json.JSONObject paymentEntity = payloadObj.getJSONObject("payment").getJSONObject("entity");
                    razorpayPaymentId = paymentEntity.getString("id");
                }
            } else if ("payment.captured".equals(eventType)) {
                org.json.JSONObject paymentEntity = payloadObj.getJSONObject("payment").getJSONObject("entity");
                razorpayOrderId = paymentEntity.getString("order_id");
                razorpayPaymentId = paymentEntity.getString("id");
            }

            if (razorpayOrderId == null) {
                log.warn("Webhook event {} did not contain razorpay_order_id", eventType);
                return;
            }

            final String finalRazorpayOrderId = razorpayOrderId;
            log.info("Webhook lookup for Razorpay Order ID: {}, Payment ID: {}", finalRazorpayOrderId, razorpayPaymentId);
            Payment payment = paymentRepository.findByRazorpayOrderId(finalRazorpayOrderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for Razorpay Order ID: " + finalRazorpayOrderId));

            // If payment is already SUCCESS, ignore duplicate event
            if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
                log.info("Payment already marked SUCCESS. Ignoring webhook event.");
                return;
            }

            // Update payment to SUCCESS
            payment.setPaymentStatus(PaymentStatus.SUCCESS);
            if (razorpayPaymentId != null) {
                payment.setRazorpayPaymentId(razorpayPaymentId);
            }
            payment.setTransactionTime(LocalDateTime.now());
            paymentRepository.save(payment);

            // Confirm order status = CONFIRMED
            Order order = payment.getOrder();
            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);

            // Trigger tracking simulator
            orderService.simulateOrderTracking(order.getId());

            // Clear cart if not already cleared
            String email = order.getUser().getEmail();
            log.info("Clearing cart for user: {}", email);
            cartService.clearCart(email);

            log.info("Webhook event {} processed successfully. Payment status updated to SUCCESS.", eventType);
        } catch (Exception e) {
            log.error("Error processing webhook payload: {}", e.getMessage(), e);
            throw new BadRequestException("Webhook event processing failed: " + e.getMessage());
        }
    }
}
