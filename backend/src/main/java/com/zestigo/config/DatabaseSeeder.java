package com.zestigo.config;

import com.zestigo.entity.*;
import com.zestigo.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final RestaurantRepository restaurantRepository;
    private final FoodItemRepository foodItemRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final CouponRepository couponRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final WishlistRepository wishlistRepository;
    private final CartRepository cartRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    public DatabaseSeeder(
            RestaurantRepository restaurantRepository,
            FoodItemRepository foodItemRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository,
            AddressRepository addressRepository,
            CouponRepository couponRepository,
            OrderRepository orderRepository,
            PaymentRepository paymentRepository,
            WishlistRepository wishlistRepository,
            CartRepository cartRepository,
            ReviewRepository reviewRepository,
            PasswordEncoder passwordEncoder,
            JdbcTemplate jdbcTemplate) {
        this.restaurantRepository = restaurantRepository;
        this.foodItemRepository = foodItemRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.couponRepository = couponRepository;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.wishlistRepository = wishlistRepository;
        this.cartRepository = cartRepository;
        this.reviewRepository = reviewRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Idempotency check: only run seeder if the restaurant table is empty
        if (restaurantRepository.count() > 0) {
            return;
        }

        // Initialize helper tables
        createDeliveryPartnersTable();

        // 1. Seed Categories (10)
        Map<String, Category> categoriesMap = seedCategories();

        // 2. Seed Demo Users (5 ROLE_USER, 5 ROLE_DELIVERY)
        Map<String, User> usersMap = seedUsers();
        userRepository.flush();

        // 3. Seed Addresses for users (5)
        seedAddresses(usersMap);

        // 4. Seed Carts for users
        seedCarts(usersMap);

        // 5. Seed Coupons
        seedCoupons();

        // 6. Seed Restaurants (20)
        List<Restaurant> restaurants = seedRestaurants(categoriesMap);

        // 7. Seed Food Items (180 total, 9 per restaurant)
        List<FoodItem> foodItems = seedFoodItems(restaurants);

        // 8. Seed Wishlists for users (some sample items)
        seedWishlists(usersMap, restaurants, foodItems);

        // 9. Seed Reviews (100 total, 5 per restaurant)
        seedReviews(usersMap, restaurants);

        // 10. Seed Delivery Partners (5 partners as users + metadata)
        seedDeliveryPartners(usersMap);

        // 11. Seed Orders & Payments (previous order history)
        seedOrdersAndPayments(usersMap, restaurants, foodItems);

        // 12. Verification Logs
        System.out.println("Seeded 20 restaurants");
        System.out.println("Seeded 180 food items");
        System.out.println("Seeded 100 reviews");
        System.out.println("Seeded 5 delivery partners");
        System.out.println("Seeded demo users successfully");
    }

    private void createDeliveryPartnersTable() {
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS delivery_partners (" +
                "id VARCHAR(36) PRIMARY KEY," +
                "user_id VARCHAR(36) UNIQUE NOT NULL," +
                "vehicle_type VARCHAR(20) NOT NULL DEFAULT 'BIKE'," +
                "is_available BOOLEAN NOT NULL DEFAULT TRUE," +
                "earnings DECIMAL(10,2) NOT NULL DEFAULT 0.00," +
                "current_lat DOUBLE PRECISION," +
                "current_lng DOUBLE PRECISION," +
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE" +
                ")");
    }

    private Map<String, Category> seedCategories() {
        Map<String, Category> map = new HashMap<>();
        String[][] categoriesData = {
            {"c1", "Biryani", "🍛", "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80&auto=format&fit=crop"},
            {"c2", "South Indian", "🥘", "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&q=80&auto=format&fit=crop"},
            {"c3", "North Indian", "🍲", "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80&auto=format&fit=crop"},
            {"c4", "Chinese", "🥢", "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&q=80&auto=format&fit=crop"},
            {"c5", "Pizza", "🍕", "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80&auto=format&fit=crop"},
            {"c6", "Burgers", "🍔", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80&auto=format&fit=crop"},
            {"c7", "Desserts", "🍰", "https://images.unsplash.com/photo-1606851091851-e8c8c0fca5ba?w=400&q=80&auto=format&fit=crop"},
            {"c8", "Beverages", "☕", "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80&auto=format&fit=crop"},
            {"c9", "Fast Food", "🍟", "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80&auto=format&fit=crop"},
            {"c10", "Cafe", "🧁", "https://images.unsplash.com/photo-1542367592-8849eb950fd8?w=400&q=80&auto=format&fit=crop"}
        };

        for (String[] data : categoriesData) {
            Category category = Category.builder()
                    .id(data[0])
                    .name(data[1])
                    .icon(data[2])
                    .image(data[3])
                    .build();
            map.put(data[1], categoryRepository.save(category));
        }
        return map;
    }

    private Map<String, User> seedUsers() {
        Map<String, User> map = new HashMap<>();
        String encodedPassword = passwordEncoder.encode("password");

        // Demo Customers (5)
        String[][] customersData = {
            {"u1", "Diwakar", "diwakar@zestigo.com", "9876543211", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80&auto=format&fit=crop"},
            {"u2", "Rahul", "rahul@zestigo.com", "9876543212", "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&q=80&auto=format&fit=crop"},
            {"u3", "Shreya", "shreya@zestigo.com", "9876543213", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop"},
            {"u4", "Aditi", "aditi@zestigo.com", "9876543214", "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80&auto=format&fit=crop"},
            {"u5", "Kiran", "kiran@zestigo.com", "9876543215", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop"}
        };

        for (String[] data : customersData) {
            User user = User.builder()
                    .id(data[0])
                    .name(data[1])
                    .email(data[2])
                    .password(encodedPassword)
                    .phone(data[3])
                    .avatar(data[4])
                    .role(Role.ROLE_USER)
                    .provider(AuthProvider.LOCAL)
                    .build();
            map.put(data[1], userRepository.save(user));
        }

        // Demo Delivery Partners as Users (5)
        String[][] deliveryData = {
            {"d1", "Rahul Kumar", "rahulkumar@zestigo.com", "9900112231"},
            {"d2", "Akash Singh", "akashsingh@zestigo.com", "9900112232"},
            {"d3", "Praveen R", "praveenr@zestigo.com", "9900112233"},
            {"d4", "Manoj Kumar", "manojkumar@zestigo.com", "9900112234"},
            {"d5", "Santhosh M", "santhoshm@zestigo.com", "9900112235"}
        };

        for (String[] data : deliveryData) {
            User user = User.builder()
                    .id(data[0])
                    .name(data[1])
                    .email(data[2])
                    .password(encodedPassword)
                    .phone(data[3])
                    .role(Role.ROLE_DELIVERY)
                    .provider(AuthProvider.LOCAL)
                    .build();
            map.put(data[1], userRepository.save(user));
        }

        return map;
    }

    private void seedAddresses(Map<String, User> usersMap) {
        String[][] addressesData = {
            {"u1", "Home", "12, 4th Block, Koramangala, Bengaluru", "12.9352", "77.6245"},
            {"u2", "Home", "80 Feet Rd, Sector 3, HSR Layout, Bengaluru", "12.9105", "77.6450"},
            {"u3", "Home", "299, 100 Feet Rd, Indiranagar, Bengaluru", "12.9719", "77.6412"},
            {"u4", "Home", "15, 4th Block, Jayanagar, Bengaluru", "12.9307", "77.5838"},
            {"u5", "Home", "44, Sampige Rd, Malleshwaram, Bengaluru", "12.9962", "77.5714"}
        };

        for (String[] data : addressesData) {
            User user = usersMap.get(userRepository.findById(data[0]).orElseThrow().getName());
            Address address = Address.builder()
                    .id("addr_" + data[0])
                    .user(user)
                    .label(data[1])
                    .line(data[2])
                    .isDefault(true)
                    .latitude(Double.parseDouble(data[3]))
                    .longitude(Double.parseDouble(data[4]))
                    .placeId("place_" + data[0])
                    .build();
            addressRepository.save(address);
        }
    }

    private void seedCarts(Map<String, User> usersMap) {
        for (User user : usersMap.values()) {
            if (user.getRole() == Role.ROLE_USER) {
                Cart cart = new Cart();
                cart.setId("cart_" + user.getId());
                cart.setUser(user);
                cartRepository.save(cart);
            }
        }
    }

    private void seedCoupons() {
        String[][] couponsData = {
            {"FLAT100", "Flat ₹100 off your order above ₹299", "flat", "100.00", "299.00"},
            {"FREEDEL", "Free delivery on orders above ₹199", "flat", "40.00", "199.00"},
            {"HALF50", "50% off up to ₹120", "percent", "50.00", "199.00"},
            {"BOGO", "Buy 1 Get 1 Free on select items", "percent", "50.00", "249.00"},
            {"FESTIVE25", "Festival special: 25% off your order", "percent", "25.00", "249.00"},
            {"ZESTIGO75", "Extra ₹75 OFF above ₹349 using ZESTIGO75", "flat", "75.00", "349.00"},
            {"WELCOME125", "Flat ₹125 OFF on first order above ₹399", "flat", "125.00", "399.00"}
        };

        for (String[] data : couponsData) {
            Coupon coupon = Coupon.builder()
                    .code(data[0])
                    .description(data[1])
                    .type(data[2])
                    .value(new BigDecimal(data[3]))
                    .minOrder(new BigDecimal(data[4]))
                    .active(true)
                    .build();
            couponRepository.save(coupon);
        }
    }

    private List<Restaurant> seedRestaurants(Map<String, Category> categoriesMap) {
        List<Restaurant> list = new ArrayList<>();

        Object[][] restaurantsData = {
            {"r1", "Meghana Foods", "Biryani • Andhra • South Indian", "4.6", 2350, 25, "0.00", "1.8", "₹₹", 
             "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80&auto=format&fit=crop", 
             "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=1400&q=80&auto=format&fit=crop", 
             "124, 1st Cross, Koramangala 5th Block, Bengaluru", true, "Spicy and aromatic Andhra style biryanis and traditional delicacies.", new String[]{"Biryani", "South Indian", "North Indian"}},
            
            {"r2", "Empire Restaurant", "North Indian • Mughlai • Fast Food", "4.3", 4100, 30, "20.00", "2.5", "₹₹", 
             "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80&auto=format&fit=crop", 
             "https://images.unsplash.com/photo-1606471191009-63994c53433b?w=1400&q=80&auto=format&fit=crop", 
             "36, Church Street, MG Road, Bengaluru", false, "Late-night legendary spot famous for its juicy kebabs and ghee rice.", new String[]{"North Indian", "Fast Food", "Chinese"}},
            
            {"r3", "RNR Biryani", "Biryani • South Indian", "4.4", 980, 28, "30.00", "3.2", "₹₹", 
             "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&q=80&auto=format&fit=crop", 
             "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1400&q=80&auto=format&fit=crop", 
             "15, 2nd Main Rd, Jayanagar 4th Block, Jayanagar, Bengaluru", false, "Famous for its authentic Nati style Donne Biryani served in eco-friendly cups.", new String[]{"Biryani", "South Indian"}},
            
            {"r4", "Paragon Restaurant", "South Indian • Chinese • North Indian", "4.5", 1450, 35, "40.00", "4.0", "₹₹", 
             "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80&auto=format&fit=crop", 
             "https://images.unsplash.com/photo-1630383249896-424e482df921?w=1400&q=80&auto=format&fit=crop", 
             "55, Brigade Road, Ashok Nagar, Bengaluru", true, "Iconic Kerala delicacies, seafood specialties, and Malabar biryani.", new String[]{"South Indian", "Chinese", "North Indian"}},
            
            {"r5", "The Rameshwaram Cafe", "South Indian • Cafe", "4.7", 3100, 20, "15.00", "1.2", "₹", 
             "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&q=80&auto=format&fit=crop", 
             "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1400&q=80&auto=format&fit=crop", 
             "299, 100 Feet Rd, Indiranagar, Bengaluru", true, "Premium quick-service South Indian restaurant famous for ghee-loaded idlis and dosas.", new String[]{"South Indian", "Cafe"}},
            
            {"r6", "Truffles", "Burgers • Cafe • Desserts • Fast Food", "4.5", 2890, 32, "25.00", "2.1", "₹₹", 
             "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&auto=format&fit=crop", 
             "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1400&q=80&auto=format&fit=crop", 
             "22, 80 Feet Road, Koramangala 4th Block, Bengaluru", true, "Bengaluru's ultimate spot for heavy gourmet burgers, steaks, and desserts.", new String[]{"Burgers", "Cafe", "Desserts", "Fast Food"}},
            
            {"r7", "KFC", "Fast Food • Burgers", "4.1", 1850, 22, "30.00", "2.8", "₹₹", 
             "https://images.unsplash.com/photo-1513639776629-7b61b0ac237b?w=800&q=80&auto=format&fit=crop", 
             "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1400&q=80&auto=format&fit=crop", 
             "18, Sector 7, HSR Layout, Bengaluru", false, "Golden, crispy fried chicken, burgers, and chicken buckets.", new String[]{"Fast Food", "Burgers"}},
            
            {"r8", "Domino's Pizza", "Pizza • Fast Food", "4.2", 2240, 30, "0.00", "1.5", "₹₹", 
             "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80&auto=format&fit=crop", 
             "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=1400&q=80&auto=format&fit=crop", 
             "90, Outer Ring Rd, HSR Layout, Bengaluru", false, "Hand-tossed cheesy pizzas, cheesy breadsticks, and desserts.", new String[]{"Pizza", "Fast Food"}},
            
            {"r9", "Burger King", "Burgers • Fast Food", "4.0", 1670, 25, "25.00", "2.3", "₹", 
             "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&auto=format&fit=crop", 
             "https://images.unsplash.com/photo-1542367592-8849eb950fd8?w=1400&q=80&auto=format&fit=crop", 
             "56, 17th Cross Road, Sector 3, HSR Layout, Bengaluru", false, "Flame-grilled burgers, crispy wraps, fries, and thick milkshakes.", new String[]{"Burgers", "Fast Food"}},
            
            {"r10", "California Burrito", "Fast Food • Healthy Food", "4.4", 1200, 28, "20.00", "1.9", "₹₹", 
             "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80&auto=format&fit=crop", 
             "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1400&q=80&auto=format&fit=crop", 
             "412, 80 Feet Road, Koramangala 6th Block, Bengaluru", true, "Build-your-own Mexican burritos, tacos, and salad bowls.", new String[]{"Fast Food"}},
            
            {"r11", "Nandhini Deluxe", "South Indian • North Indian • Biryani", "4.2", 1100, 32, "30.00", "3.5", "₹₹", 
             "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80&auto=format&fit=crop", 
             "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=1400&q=80&auto=format&fit=crop", 
             "21, 60 Feet Road, Koramangala 3rd Block, Bengaluru", false, "Traditional spicy Andhra style meals and signature biryanis.", new String[]{"Biryani", "South Indian", "North Indian"}},
            
            {"r12", "Shivaji Military Hotel", "Biryani • South Indian", "4.6", 1980, 30, "35.00", "4.2", "₹₹", 
             "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&q=80&auto=format&fit=crop", 
             "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1400&q=80&auto=format&fit=crop", 
             "718, 1st C Cross Rd, Jayanagar 8th Block, Bengaluru", true, "Iconic Maratha style mutton biryani and chicken starters.", new String[]{"Biryani", "South Indian"}},
            
            {"r13", "The Fisherman's Wharf", "South Indian • Seafood", "4.3", 850, 40, "50.00", "5.5", "₹₹₹", 
             "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80&auto=format&fit=crop", 
             "https://images.unsplash.com/photo-1630383249896-424e482df921?w=1400&q=80&auto=format&fit=crop", 
             "26, Ambalipura - Sarjapur Road, Haralur, Bengaluru", false, "Authentic Goan seafood, coastal dishes, and a beachy vibe.", new String[]{"South Indian"}},
            
            {"r14", "A2B (Adyar Ananda Bhavan)", "South Indian • Fast Food • Desserts", "4.4", 1720, 20, "15.00", "1.6", "₹", 
             "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&q=80&auto=format&fit=crop", 
             "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1400&q=80&auto=format&fit=crop", 
             "14, Outer Ring Rd, BTM Layout, Bengaluru", false, "Reliable pure-vegetarian brand for dosas, idlis, and sweets.", new String[]{"South Indian", "Fast Food", "Desserts"}},
            
            {"r15", "Behrouz Biryani", "Biryani • North Indian", "4.2", 1430, 35, "35.00", "4.8", "₹₹₹", 
             "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80&auto=format&fit=crop", 
             "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1400&q=80&auto=format&fit=crop", 
             "18, ITPL Main Road, Whitefield, Bengaluru", true, "Premium royal dum-cooked biryanis loaded with nuts and spices.", new String[]{"Biryani", "North Indian"}},
            
            {"r16", "Biryani By Kilo", "Biryani • North Indian", "4.3", 1150, 38, "30.00", "3.9", "₹₹₹", 
             "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80&auto=format&fit=crop", 
             "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=1400&q=80&auto=format&fit=crop", 
             "80, Sampige Road, Malleshwaram, Bengaluru", false, "Authentic fresh dum biryanis cooked and served in handi pots.", new String[]{"Biryani", "North Indian"}},
            
            {"r17", "Anand Sweets & Savouries", "Desserts • Fast Food", "4.6", 1540, 22, "20.00", "2.0", "₹₹", 
             "https://images.unsplash.com/photo-1606851091851-e8c8c0fca5ba?w=800&q=80&auto=format&fit=crop", 
             "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1400&q=80&auto=format&fit=crop", 
             "8, Brigade Road, Haralur, Bengaluru", true, "Legendary sweet shop serving premium halwas, laddoos, and chaats.", new String[]{"Desserts", "Fast Food"}},
            
            {"r18", "Plan B", "Burgers • Fast Food • Chinese", "4.4", 980, 28, "25.00", "2.7", "₹₹", 
             "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&auto=format&fit=crop", 
             "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1400&q=80&auto=format&fit=crop", 
             "20, 100 Feet Road, Indiranagar, Bengaluru", false, "Famous for spicy chicken wings, burgers, and classic pub grub.", new String[]{"Burgers", "Fast Food", "Chinese"}},
            
            {"r19", "Chai Point", "Beverages • Fast Food • Cafe", "4.3", 1200, 18, "0.00", "1.1", "₹", 
             "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80&auto=format&fit=crop", 
             "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=1400&q=80&auto=format&fit=crop", 
             "44, 15th Cross Rd, Malleshwaram, Bengaluru", false, "India's largest chai brand serving freshly brewed tea and quick snacks.", new String[]{"Beverages", "Fast Food", "Cafe"}},
            
            {"r20", "Starbucks", "Beverages • Cafe • Desserts", "4.5", 1620, 22, "30.00", "2.7", "₹₹", 
             "https://images.unsplash.com/photo-1542367592-8849eb950fd8?w=800&q=80&auto=format&fit=crop", 
             "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=1400&q=80&auto=format&fit=crop", 
             "10, Hosur Road, Electronic City, Bengaluru", true, "Globally beloved coffee house offering hot brews, frappes, and cakes.", new String[]{"Beverages", "Cafe", "Desserts"}}
        };

        for (Object[] data : restaurantsData) {
            Set<Category> categoriesSet = new HashSet<>();
            String[] cats = (String[]) data[14];
            for (String catName : cats) {
                if (categoriesMap.containsKey(catName)) {
                    categoriesSet.add(categoriesMap.get(catName));
                }
            }

            Restaurant restaurant = Restaurant.builder()
                    .id((String) data[0])
                    .name((String) data[1])
                    .cuisine((String) data[2])
                    .rating(new BigDecimal((String) data[3]))
                    .reviewsCount((Integer) data[4])
                    .deliveryTime((Integer) data[5])
                    .deliveryFee(new BigDecimal((String) data[6]))
                    .distance(new BigDecimal((String) data[7]))
                    .priceRange((String) data[8])
                    .imageUrl((String) data[9])
                    .bannerUrl((String) data[10])
                    .address((String) data[11])
                    .promoted((Boolean) data[12])
                    .description((String) data[13])
                    .categories(categoriesSet)
                    .build();

            list.add(restaurantRepository.save(restaurant));
        }

        return list;
    }

    private List<FoodItem> seedFoodItems(List<Restaurant> restaurants) {
        List<FoodItem> list = new ArrayList<>();
        int itemIndex = 1;

        // Define dishes profiles per category
        Object[][] dishesTemplates = {
            // Biryani (c1)
            {"Chicken Biryani", "Aromatic long grain basmati rice cooked with succulent chicken pieces.", "320.00", "Biryani", false, false},
            {"Mutton Biryani", "Royal mutton dum biryani layered with golden brown onions and saffron.", "420.00", "Biryani", false, false},
            {"Paneer Biryani", "Fragrant biryani rice cooked with tender paneer cubes and mild spices.", "260.00", "Biryani", true, false},
            // South Indian (c2)
            {"Masala Dosa", "Crispy rice crepe filled with spiced potato mash, served with coconut chutney.", "110.00", "South Indian", true, true},
            {"Idli Vada Combo", "Steamed soft idlis paired with a crispy deep-fried lentil donut.", "90.00", "South Indian", true, true},
            // North Indian (c3)
            {"Paneer Butter Masala", "Cottage cheese cubes cooked in a rich, buttery, creamy tomato gravy.", "240.00", "North Indian", true, true},
            {"Butter Naan", "Soft, tandoor-baked flatbread brushed generously with melted butter.", "45.00", "North Indian", true, false},
            // Chinese (c4)
            {"Veg Fried Rice", "Wok-tossed basmati rice loaded with finely chopped fresh vegetables.", "210.00", "Chinese", true, false},
            {"Chicken Hakka Noodles", "Stir-fried wheat noodles with shredded chicken and crunchy veggies.", "250.00", "Chinese", false, false},
            // Pizza (c5)
            {"Margherita Pizza", "Classic cheese and tomato pizza topped with fresh basil leaves.", "230.00", "Pizza", true, true},
            {"Farmhouse Pizza", "Hand-tossed pizza loaded with onions, bell peppers, mushrooms, and tomatoes.", "380.00", "Pizza", true, false},
            // Burgers (c6)
            {"Veg Cheese Burger", "Crispy mixed vegetable patty topped with a slice of processed cheese.", "160.00", "Burgers", true, false},
            {"Chicken Zinger Burger", "Signature crispy fried chicken fillet burger with lettuce and mayo.", "190.00", "Burgers", false, true},
            // Desserts (c7)
            {"Gulab Jamun 2 Pc", "Deep-fried milk solids dumplings soaked in cardomom sugar syrup.", "80.00", "Desserts", true, false},
            {"Choco Lava Cake", "Warm chocolate cake with a gooey, molten chocolate center.", "110.00", "Desserts", true, true},
            // Beverages (c8)
            {"Filter Coffee", "Aromatic, frothy South Indian style milk coffee brewed in a brass filter.", "50.00", "Beverages", true, true},
            {"Sweet Lassi", "Chilled, sweet, whipped yogurt drink topped with a layer of malai.", "80.00", "Beverages", true, false},
            // Fast Food (c9)
            {"French Fries", "Golden, salted deep-fried potato sticks, served with ketchup.", "120.00", "Fast Food", true, false},
            {"Chicken Nuggets", "Crispy, bite-sized breaded chicken chunks, served with dip.", "160.00", "Fast Food", false, false},
            // Cafe (c10)
            {"Cold Brew Coffee", "Slow-steeped, refreshing black iced coffee served over ice cubes.", "180.00", "Cafe", true, false},
            {"Blueberry Muffin", "Moist, oven-fresh muffin loaded with real blueberries.", "160.00", "Cafe", true, false}
        };

        // We need 180 food items. That's exactly 9 items per restaurant.
        for (Restaurant r : restaurants) {
            // Pick 9 templates based on the restaurant's cuisines/style to make it look realistic
            List<Object[]> selectedTemplates = chooseTemplatesForRestaurant(r.getName(), dishesTemplates);
            
            for (Object[] temp : selectedTemplates) {
                FoodItem item = FoodItem.builder()
                        .id("f" + itemIndex)
                        .restaurant(r)
                        .name((String) temp[0])
                        .description((String) temp[1])
                        .price(new BigDecimal((String) temp[2]))
                        .category((String) temp[3])
                        .rating(new BigDecimal(String.format(Locale.US, "%.1f", 4.0 + (Math.random() * 0.8))))
                        .reviewsCount(50 + (int) (Math.random() * 400))
                        .veg((Boolean) temp[4])
                        .popular((Boolean) temp[5])
                        .imageUrl(getFoodImageUrl((String) temp[3]))
                        .build();

                foodItemRepository.save(item);
                list.add(item);
                itemIndex++;
            }
        }

        return list;
    }

    private List<Object[]> chooseTemplatesForRestaurant(String name, Object[][] templates) {
        List<Object[]> result = new ArrayList<>();
        // Select templates based on name keywords to match culinary profile
        if (name.contains("Meghana") || name.contains("Shivaji") || name.contains("RNR") || name.contains("Behrouz") || name.contains("Kilo") || name.contains("Nandhini")) {
            // Biryani & South Indian heavy
            result.add(templates[0]); // Chicken Biryani
            result.add(templates[1]); // Mutton Biryani
            result.add(templates[2]); // Paneer Biryani
            result.add(templates[3]); // Masala Dosa
            result.add(templates[5]); // Paneer Butter Masala
            result.add(templates[6]); // Butter Naan
            result.add(templates[7]); // Veg Fried Rice
            result.add(templates[13]); // Gulab Jamun
            result.add(templates[17]); // French Fries
        } else if (name.contains("Empire") || name.contains("Paragon") || name.contains("Wharf")) {
            // North Indian & Chinese & Fast Food
            result.add(templates[0]); // Chicken Biryani
            result.add(templates[1]); // Mutton Biryani
            result.add(templates[5]); // Paneer Butter Masala
            result.add(templates[6]); // Butter Naan
            result.add(templates[7]); // Veg Fried Rice
            result.add(templates[8]); // Chicken Hakka Noodles
            result.add(templates[13]); // Gulab Jamun
            result.add(templates[17]); // French Fries
            result.add(templates[18]); // Chicken Nuggets
        } else if (name.contains("Rameshwaram") || name.contains("A2B")) {
            // South Indian Pure Veg & Sweets
            result.add(templates[3]); // Masala Dosa
            result.add(templates[4]); // Idli Vada
            result.add(templates[2]); // Paneer Biryani (veg)
            result.add(templates[5]); // Paneer Butter Masala
            result.add(templates[6]); // Butter Naan
            result.add(templates[7]); // Veg Fried Rice
            result.add(templates[13]); // Gulab Jamun
            result.add(templates[15]); // Filter Coffee
            result.add(templates[16]); // Sweet Lassi
        } else if (name.contains("Truffles") || name.contains("Burger") || name.contains("KFC") || name.contains("Plan B")) {
            // Burgers, Fast Food & Western
            result.add(templates[11]); // Veg Cheese Burger
            result.add(templates[12]); // Chicken Zinger Burger
            result.add(templates[9]); // Margherita Pizza
            result.add(templates[17]); // French Fries
            result.add(templates[18]); // Chicken Nuggets
            result.add(templates[14]); // Choco Lava Cake
            result.add(templates[19]); // Cold Brew Coffee
            result.add(templates[20]); // Blueberry Muffin
            result.add(templates[8]); // Chicken Hakka Noodles
        } else if (name.contains("Domino") || name.contains("Pizza")) {
            // Pizza & Fast Food
            result.add(templates[9]); // Margherita Pizza
            result.add(templates[10]); // Farmhouse Pizza
            result.add(templates[17]); // French Fries
            result.add(templates[18]); // Chicken Nuggets
            result.add(templates[14]); // Choco Lava Cake
            result.add(templates[13]); // Gulab Jamun
            result.add(templates[16]); // Sweet Lassi
            result.add(templates[11]); // Veg Cheese Burger
            result.add(templates[7]); // Veg Fried Rice
        } else {
            // Cafe & Beverages (Starbucks, Chai Point, Anand Sweets)
            result.add(templates[15]); // Filter Coffee
            result.add(templates[16]); // Sweet Lassi
            result.add(templates[19]); // Cold Brew Coffee
            result.add(templates[20]); // Blueberry Muffin
            result.add(templates[13]); // Gulab Jamun
            result.add(templates[14]); // Choco Lava Cake
            result.add(templates[11]); // Veg Cheese Burger
            result.add(templates[17]); // French Fries
            result.add(templates[3]); // Masala Dosa
        }
        return result;
    }

    private String getFoodImageUrl(String category) {
        switch (category) {
            case "Biryani":
                return "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80&auto=format&fit=crop";
            case "South Indian":
                return "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&q=80&auto=format&fit=crop";
            case "North Indian":
                return "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80&auto=format&fit=crop";
            case "Chinese":
                return "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&q=80&auto=format&fit=crop";
            case "Pizza":
                return "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80&auto=format&fit=crop";
            case "Burgers":
                return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80&auto=format&fit=crop";
            case "Desserts":
                return "https://images.unsplash.com/photo-1606851091851-e8c8c0fca5ba?w=400&q=80&auto=format&fit=crop";
            case "Beverages":
                return "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80&auto=format&fit=crop";
            case "Fast Food":
                return "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80&auto=format&fit=crop";
            case "Cafe":
            default:
                return "https://images.unsplash.com/photo-1542367592-8849eb950fd8?w=400&q=80&auto=format&fit=crop";
        }
    }

    private void seedWishlists(Map<String, User> usersMap, List<Restaurant> restaurants, List<FoodItem> foodItems) {
        User diwakar = usersMap.get("Diwakar");
        User rahul = usersMap.get("Rahul");

        if (diwakar != null && !restaurants.isEmpty()) {
            wishlistRepository.save(new Wishlist("w1", diwakar, restaurants.get(0).getId(), "restaurants", LocalDateTime.now()));
            if (!foodItems.isEmpty()) {
                wishlistRepository.save(new Wishlist("w2", diwakar, foodItems.get(0).getId(), "foods", LocalDateTime.now()));
            }
        }
        if (rahul != null && restaurants.size() > 1) {
            wishlistRepository.save(new Wishlist("w3", rahul, restaurants.get(1).getId(), "restaurants", LocalDateTime.now()));
        }
    }

    private void seedReviews(Map<String, User> usersMap, List<Restaurant> restaurants) {
        String[] usersKeys = {"Diwakar", "Rahul", "Shreya", "Aditi", "Kiran"};
        String[][] reviewsPool = {
            {"5", "Best food experience in Bengaluru! Super tasty and hygiene is perfect."},
            {"4", "Really authentic flavors. Packaging was top-notch and spill-free."},
            {"5", "Quick delivery and awesome portion size. Worth every single rupee!"},
            {"4", "Loved the spices. Tasted fresh. Will definitely order from here again."},
            {"5", "Absolutely delicious! Delivery partner was very polite too."}
        };

        int reviewIndex = 1;
        for (Restaurant r : restaurants) {
            // Seed exactly 5 reviews per restaurant to reach exactly 100 reviews in total (20 * 5 = 100)
            for (int i = 0; i < 5; i++) {
                User user = usersMap.get(usersKeys[i]);
                String[] reviewData = reviewsPool[i];

                Review review = Review.builder()
                        .id("rev" + reviewIndex)
                        .user(user)
                        .restaurant(r)
                        .rating(Integer.parseInt(reviewData[0]))
                        .comment(reviewData[1])
                        .build();

                reviewRepository.save(review);
                reviewIndex++;
            }
        }
    }

    private void seedDeliveryPartners(Map<String, User> usersMap) {
        String[][] partnersData = {
            {"dp1", "Rahul Kumar", "BIKE", "true", "450.00"},
            {"dp2", "Akash Singh", "SCOOTER", "true", "520.00"},
            {"dp3", "Praveen R", "BICYCLE", "true", "280.00"},
            {"dp4", "Manoj Kumar", "BIKE", "true", "610.00"},
            {"dp5", "Santhosh M", "CAR", "true", "890.00"}
        };

        for (String[] data : partnersData) {
            User user = usersMap.get(data[1]);
            if (user != null) {
                jdbcTemplate.update("INSERT INTO delivery_partners (id, user_id, vehicle_type, is_available, earnings, current_lat, current_lng) " +
                                "VALUES (?, ?, ?, ?, ?, ?, ?) " +
                                "ON CONFLICT (user_id) DO NOTHING",
                        data[0], user.getId(), data[2], Boolean.parseBoolean(data[3]), new BigDecimal(data[4]), 12.9716, 77.5946);
            }
        }
    }

    private void seedOrdersAndPayments(Map<String, User> usersMap, List<Restaurant> restaurants, List<FoodItem> foodItems) {
        String[] usersKeys = {"Diwakar", "Rahul", "Shreya", "Aditi", "Kiran"};

        for (int i = 0; i < usersKeys.length; i++) {
            User user = usersMap.get(usersKeys[i]);
            Restaurant r = restaurants.get(i % restaurants.size());

            // Create Order
            Order order = Order.builder()
                    .id("o_" + user.getId())
                    .user(user)
                    .restaurant(r)
                    .restaurantName(r.getName())
                    .totalAmount(new BigDecimal("450.00"))
                    .status(OrderStatus.DELIVERED)
                    .address("Home Address, Bengaluru")
                    .build();

            Order savedOrder = orderRepository.save(order);

            // Find food item of this restaurant
            FoodItem f = foodItems.stream()
                    .filter(item -> item.getRestaurant().getId().equals(r.getId()))
                    .findFirst()
                    .orElse(foodItems.get(0));

            // Create OrderItem
            OrderItem orderItem = OrderItem.builder()
                    .id("oi_" + savedOrder.getId())
                    .order(savedOrder)
                    .foodItem(f)
                    .quantity(1)
                    .priceAtPurchase(f.getPrice())
                    .build();

            // Note: CascadeType.ALL is configured on Order's items list, but we still need to associate them
            savedOrder.getItems().add(orderItem);
            orderRepository.save(savedOrder);

            // Create Payment
            Payment payment = Payment.builder()
                    .id("pay_" + savedOrder.getId())
                    .order(savedOrder)
                    .amount(new BigDecimal("450.00"))
                    .paymentMethod(PaymentMethod.UPI)
                    .paymentStatus(PaymentStatus.SUCCESS)
                    .razorpayOrderId("rzp_order_" + savedOrder.getId())
                    .razorpayPaymentId("rzp_pay_" + savedOrder.getId())
                    .transactionTime(LocalDateTime.now())
                    .build();

            paymentRepository.save(payment);
        }
    }
}
