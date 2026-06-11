-- Zestigo Database Schema Migration: Add Razorpay Payments Support
-- Run this on your existing MySQL instance to update the schema

-- 1. Add new columns
ALTER TABLE payments ADD COLUMN razorpay_order_id VARCHAR(100) UNIQUE NULL AFTER order_id;
ALTER TABLE payments ADD COLUMN razorpay_payment_id VARCHAR(100) UNIQUE NULL AFTER razorpay_order_id;
ALTER TABLE payments ADD COLUMN razorpay_signature VARCHAR(255) NULL AFTER razorpay_payment_id;
ALTER TABLE payments ADD COLUMN amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER razorpay_signature;
ALTER TABLE payments ADD COLUMN currency VARCHAR(10) NOT NULL DEFAULT 'INR' AFTER amount;
ALTER TABLE payments ADD COLUMN payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' AFTER payment_method;
ALTER TABLE payments ADD COLUMN refund_status VARCHAR(50) DEFAULT 'NOT_REFUNDED' AFTER payment_status;
ALTER TABLE payments ADD COLUMN transaction_time TIMESTAMP NULL AFTER refund_status;
ALTER TABLE payments ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- 2. Migrate existing status data to new column
UPDATE payments SET payment_status = status WHERE status IS NOT NULL;

-- 3. Clean up obsolete columns
ALTER TABLE payments DROP COLUMN status;
ALTER TABLE payments DROP COLUMN transaction_id;

-- 4. Adjust payment_method length constraint (if previously limited to 20)
ALTER TABLE payments MODIFY COLUMN payment_method VARCHAR(50) NOT NULL;
