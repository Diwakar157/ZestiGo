-- Disable foreign key checks to safely clear all tables
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM payments;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM wishlist;
DELETE FROM reviews;
DELETE FROM cart_items;
DELETE FROM cart;
DELETE FROM addresses;
DELETE FROM restaurant_categories;
DELETE FROM food_items;
DELETE FROM restaurants;
DELETE FROM food_categories;
DELETE FROM coupons;
DELETE FROM users;

SET FOREIGN_KEY_CHECKS = 1;

-- Seed Demo User (password is 'password')
INSERT INTO users (id, name, email, password, phone, avatar, role) VALUES
('u1', 'Aarav Sharma', 'demo@zestigo.com', '$2a$10$Lk9nT.bz6Zb1zqoSm9ELZevOR630V9Wt2m6RIzqrBn1h6Cqd60k76', '+91 98765 43210', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80&auto=format&fit=crop', 'ROLE_USER');

-- Seed Food Categories
INSERT INTO food_categories (id, name, icon, image_url) VALUES
('c1', 'Biryani', '🍛', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80&auto=format&fit=crop'),
('c2', 'South Indian', '🥘', 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&q=80&auto=format&fit=crop'),
('c3', 'North Indian', '🍲', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80&auto=format&fit=crop'),
('c4', 'Chinese', '🥢', 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&q=80&auto=format&fit=crop'),
('c5', 'Street Food', '🌯', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80&auto=format&fit=crop'),
('c6', 'Pizza', '🍕', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80&auto=format&fit=crop'),
('c7', 'Burgers', '🍔', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80&auto=format&fit=crop'),
('c8', 'Desserts', '🍰', 'https://images.unsplash.com/photo-1606851091851-e8c8c0fca5ba?w=400&q=80&auto=format&fit=crop'),
('c9', 'Beverages', '☕', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80&auto=format&fit=crop'),
('c10', 'Thalis', '🍽️', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80&auto=format&fit=crop');

-- Seed Restaurants
INSERT INTO restaurants (id, name, cuisine, rating, reviews_count, delivery_time, delivery_fee, distance, price_range, image_url, banner_url, address, promoted, description) VALUES
('r1', 'Meghana Foods', 'Andhra • Biryani • South Indian', 4.6, 18240, 32, 0.00, 2.4, '₹₹', 
 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80&auto=format&fit=crop', 
 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=1400&q=80&auto=format&fit=crop', 
 'Residency Road, Bengaluru', TRUE, 'Legendary Andhra-style boneless chicken biryani, spicy curries, and fiery starters loved across Bengaluru.'),

('r2', 'Empire Restaurant', 'North Indian • Kebabs • Biryani', 4.3, 24560, 28, 25.00, 1.8, '₹₹', 
 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80&auto=format&fit=crop', 
 'https://images.unsplash.com/photo-1606471191009-63994c53433b?w=1400&q=80&auto=format&fit=crop', 
 'Church Street, Bengaluru', TRUE, 'Iconic late-night spot for butter chicken, kebabs, naans, and rich North Indian gravies.'),

('r3', 'Truffles', 'Burgers • Continental • Cafe', 4.5, 15320, 30, 30.00, 3.1, '₹₹', 
 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&auto=format&fit=crop', 
 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1400&q=80&auto=format&fit=crop', 
 'Koramangala, Bengaluru', TRUE, 'Bengaluru''s favourite for juicy burgers, loaded fries, sizzlers, and thick shakes.'),

('r4', 'Adyar Ananda Bhavan (A2B)', 'South Indian • Sweets • Tiffin', 4.4, 12080, 26, 20.00, 1.5, '₹', 
 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&q=80&auto=format&fit=crop', 
 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1400&q=80&auto=format&fit=crop', 
 'T. Nagar, Chennai', TRUE, 'Crispy dosas, fluffy idlis, filter coffee, and a huge counter of fresh Indian sweets.'),

('r5', 'Nagarjuna', 'Andhra • Chinese • Biryani', 4.2, 9870, 35, 35.00, 4.2, '₹₹', 
 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&q=80&auto=format&fit=crop', 
 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=1400&q=80&auto=format&fit=crop', 
 'Banjara Hills, Hyderabad', FALSE, 'Authentic Andhra meals on banana leaf, spicy biryanis, and Indo-Chinese favourites.'),

('r6', 'Behrouz Biryani', 'Biryani • Mughlai • Kebabs', 4.1, 7640, 40, 49.00, 5.0, '₹₹₹', 
 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80&auto=format&fit=crop', 
 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1400&q=80&auto=format&fit=crop', 
 'Andheri West, Mumbai', TRUE, 'Royal dum-cooked biryanis layered with saffron, served with shorba and gulab jamun.'),

('r7', 'Chai Point', 'Beverages • Snacks • Street Food', 4.3, 5410, 18, 0.00, 1.1, '₹', 
 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80&auto=format&fit=crop', 
 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=1400&q=80&auto=format&fit=crop', 
 'Park Street, Kolkata', FALSE, 'Freshly brewed masala chai, hot samosas, vada pav, and quick desi snacks on the go.'),

('r8', 'Third Wave Coffee', 'Coffee • Beverages • Cafe', 4.5, 6320, 22, 30.00, 2.7, '₹₹', 
 'https://images.unsplash.com/photo-1542367592-8849eb950fd8?w=800&q=80&auto=format&fit=crop', 
 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=1400&q=80&auto=format&fit=crop', 
 'Koregaon Park, Pune', TRUE, 'Specialty single-origin coffee, cold brews, and freshly baked cakes in a cosy cafe.'),

('r9', 'Pizza Hut', 'Pizza • Italian • Fast Food', 4.0, 21450, 34, 40.00, 3.6, '₹₹', 
 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80&auto=format&fit=crop', 
 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=1400&q=80&auto=format&fit=crop', 
 'Lower Parel, Mumbai', FALSE, 'Cheesy pan pizzas, garlic breadsticks, and combos perfect for sharing with family.'),

('r10', 'Domino''s Pizza', 'Pizza • Italian • Fast Food', 4.1, 30210, 30, 25.00, 2.2, '₹₹', 
 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80&auto=format&fit=crop', 
 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1400&q=80&auto=format&fit=crop', 
 'Connaught Place, Delhi', TRUE, 'India''s go-to for farmhouse pizzas, cheese burst crusts, and 30-minute delivery.');

-- Seed Restaurant-Category Join Table Relationships
INSERT INTO restaurant_categories (restaurant_id, category_id) VALUES
('r1', 'c1'), ('r1', 'c2'),
('r2', 'c3'), ('r2', 'c1'),
('r3', 'c7'), ('r3', 'c6'),
('r4', 'c2'), ('r4', 'c8'),
('r5', 'c1'), ('r5', 'c4'),
('r6', 'c1'), ('r6', 'c3'),
('r7', 'c9'), ('r7', 'c5'),
('r8', 'c9'), ('r8', 'c8'),
('r9', 'c6'), ('r9', 'c7'),
('r10', 'c6');

-- Seed Food Items
INSERT INTO food_items (id, restaurant_id, name, description, price, image_url, category, rating, reviews_count, popular, veg) VALUES
('f1', 'r1', 'Chicken Biryani', 'Signature Andhra-style boneless chicken dum biryani with raita and salan.', 320.00, 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80&auto=format&fit=crop', 'Biryani', 4.7, 5240, TRUE, FALSE),
('f2', 'r4', 'Masala Dosa', 'Crispy golden dosa stuffed with spiced potato masala, sambar and chutneys.', 120.00, 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&q=80&auto=format&fit=crop', 'South Indian', 4.6, 3120, TRUE, TRUE),
('f3', 'r2', 'Paneer Butter Masala', 'Soft paneer cubes in a rich, creamy tomato and cashew gravy.', 240.00, 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80&auto=format&fit=crop', 'North Indian', 4.5, 2810, TRUE, TRUE),
('f4', 'r2', 'Butter Naan', 'Soft tandoor-baked naan brushed with melted butter.', 45.00, 'https://images.unsplash.com/photo-1606471191009-63994c53433b?w=800&q=80&auto=format&fit=crop', 'North Indian', 4.4, 1890, TRUE, TRUE),
('f5', 'r4', 'Idli Vada', 'Steamed idlis and crispy medu vada served with sambar and coconut chutney.', 90.00, 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=800&q=80&auto=format&fit=crop', 'South Indian', 4.5, 2040, TRUE, TRUE),
('f6', 'r5', 'Gobi Manchurian', 'Crispy fried cauliflower tossed in a spicy Indo-Chinese Manchurian sauce.', 180.00, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&q=80&auto=format&fit=crop', 'Chinese', 4.3, 1560, TRUE, TRUE),
('f7', 'r2', 'Chole Bhature', 'Fluffy fried bhature served with spicy chickpea curry and pickled onions.', 160.00, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80&auto=format&fit=crop', 'North Indian', 4.5, 2230, TRUE, TRUE),
('f8', 'r7', 'Pav Bhaji', 'Buttery mashed vegetable bhaji served with toasted pav and lemon.', 130.00, 'https://images.unsplash.com/photo-1631292784640-2b24be784d5d?w=800&q=80&auto=format&fit=crop', 'Street Food', 4.4, 1980, TRUE, TRUE),
('f9', 'r4', 'Gulab Jamun', 'Warm, melt-in-the-mouth milk dumplings soaked in rose-cardamom syrup.', 80.00, 'https://images.unsplash.com/photo-1606851091851-e8c8c0fca5ba?w=800&q=80&auto=format&fit=crop', 'Desserts', 4.8, 2670, TRUE, TRUE),
('f10', 'r4', 'Filter Coffee', 'Authentic South Indian filter coffee, frothy and aromatic.', 50.00, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80&auto=format&fit=crop', 'Beverages', 4.7, 1420, TRUE, TRUE),
('f11', 'r6', 'Mutton Biryani', 'Royal dum-cooked mutton biryani layered with saffron and fried onions.', 420.00, 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&q=80&auto=format&fit=crop', 'Biryani', 4.6, 3340, FALSE, FALSE),
('f12', 'r2', 'Butter Chicken', 'Tandoori chicken simmered in a velvety buttery tomato gravy.', 320.00, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80&auto=format&fit=crop', 'North Indian', 4.6, 4120, FALSE, FALSE),
('f13', 'r5', 'Hakka Noodles', 'Wok-tossed noodles with crunchy vegetables and Indo-Chinese spices.', 170.00, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80&auto=format&fit=crop', 'Chinese', 4.2, 980, FALSE, TRUE),
('f14', 'r9', 'Margherita Pizza', 'Classic hand-tossed pizza with mozzarella, tomato and fresh basil.', 230.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80&auto=format&fit=crop', 'Pizza', 4.3, 2150, FALSE, TRUE),
('f15', 'r3', 'Classic Veg Burger', 'Crunchy aloo-tikki patty, fresh veggies and house sauce in a soft bun.', 140.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&auto=format&fit=crop', 'Burgers', 4.4, 1760, FALSE, TRUE),
('f16', 'r10', 'Farmhouse Pizza', 'Loaded with onion, capsicum, mushroom, tomato and extra cheese.', 360.00, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80&auto=format&fit=crop', 'Pizza', 4.2, 2890, FALSE, TRUE),
('f17', 'r7', 'Masala Chai', 'Freshly brewed cutting chai with ginger, cardamom and aromatic spices.', 30.00, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80&auto=format&fit=crop', 'Beverages', 4.5, 1230, FALSE, TRUE),
('f18', 'r8', 'Cold Brew Coffee', 'Smooth, slow-steeped cold brew served over ice.', 180.00, 'https://images.unsplash.com/photo-1542367592-8849eb950fd8?w=800&q=80&auto=format&fit=crop', 'Beverages', 4.4, 870, FALSE, TRUE);

-- Seed Coupons
INSERT INTO coupons (code, description, type, value, min_order, active) VALUES
('FLAT100', 'Flat ₹100 off your order', 'flat', 100.00, 299.00, TRUE),
('FREEDEL', 'Free delivery on orders above ₹199', 'flat', 40.00, 199.00, TRUE),
('HALF50', '50% off up to ₹120', 'percent', 50.00, 199.00, TRUE),
('BOGO', 'Buy 1 Get 1 Free on select items', 'percent', 50.00, 249.00, TRUE),
('FESTIVE25', 'Festival special: 25% off your order', 'percent', 25.00, 249.00, TRUE);

-- Seed saved addresses for the demo user
INSERT INTO addresses (id, user_id, label, line, is_default) VALUES
('a1', 'u1', 'Home', '12, 4th Block, Koramangala, Bengaluru', TRUE),
('a2', 'u1', 'Work', 'Prestige Tech Park, Marathahalli, Bengaluru', FALSE);
