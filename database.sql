-- November Brands Database Setup
-- Prepared for: if0_39282388_november_brands_db
-- Version: 1.0

USE `if0_39282388_november_brands_db`;

-- ========================
-- Table: users
-- ========================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(50) UNIQUE NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) UNIQUE,
  `phone` VARCHAR(20) UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `is_admin` BOOLEAN DEFAULT FALSE,
  `is_verified` BOOLEAN DEFAULT FALSE,
  `newsletter` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`),
  INDEX `idx_phone` (`phone`),
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================
-- Table: products
-- ========================
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` VARCHAR(50) UNIQUE NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` ENUM('skincare','haircare','perfumes') NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `stock_quantity` INT DEFAULT 0,
  `image_url` VARCHAR(500),
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category`),
  INDEX `idx_product_id` (`product_id`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================
-- Table: orders
-- ========================
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(50) UNIQUE NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `status` ENUM('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `customer_name` VARCHAR(200) NOT NULL,
  `customer_email` VARCHAR(255),
  `customer_phone` VARCHAR(20),
  `shipping_address` TEXT,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================
-- Table: order_items
-- ========================
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================
-- Table: favorites
-- ========================
CREATE TABLE IF NOT EXISTS `favorites` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_favorite` (`user_id`, `product_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================
-- Table: cart
-- ========================
CREATE TABLE IF NOT EXISTS `cart` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_cart_item` (`user_id`, `product_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================
-- Table: activity_log
-- ========================
CREATE TABLE IF NOT EXISTS `activity_log` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(50),
  `action` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================
-- Sample Products
-- ========================
INSERT IGNORE INTO `products` (`product_id`, `name`, `description`, `category`, `price`, `stock_quantity`, `image_url`) VALUES
('product_001', 'Vitamin C Serum', 'Brightening serum with 20% Vitamin C for radiant skin', 'skincare', 45.00, 50, 'https://via.placeholder.com/300x250/ffb6c1/000000?text=Vitamin+C+Serum'),
('product_002', 'Hyaluronic Acid Moisturizer', 'Deep hydrating moisturizer for all skin types', 'skincare', 38.00, 30, 'https://via.placeholder.com/300x250/ffb6c1/000000?text=Hyaluronic+Moisturizer'),
('product_003', 'Retinol Night Cream', 'Anti-aging night cream with retinol for smooth skin', 'skincare', 52.00, 25, 'https://via.placeholder.com/300x250/ffb6c1/000000?text=Retinol+Cream'),
('product_004', 'Gentle Cleanser', 'Mild cleansing gel for sensitive skin', 'skincare', 25.00, 40, 'https://via.placeholder.com/300x250/ffb6c1/000000?text=Gentle+Cleanser'),
('product_005', 'Anti-Aging Eye Cream', 'Reduces fine lines and dark circles', 'skincare', 42.00, 20, 'https://via.placeholder.com/300x250/ffb6c1/000000?text=Eye+Cream'),

('product_006', 'Argan Oil Hair Mask', 'Nourishing hair mask with organic argan oil', 'haircare', 35.00, 40, 'https://via.placeholder.com/300x250/ffd700/000000?text=Argan+Hair+Mask'),
('product_007', 'Keratin Shampoo', 'Strengthening shampoo with keratin complex', 'haircare', 28.00, 60, 'https://via.placeholder.com/300x250/ffd700/000000?text=Keratin+Shampoo'),
('product_008', 'Hair Growth Serum', 'Advanced serum to promote healthy hair growth', 'haircare', 48.00, 20, 'https://via.placeholder.com/300x250/ffd700/000000?text=Growth+Serum'),
('product_009', 'Deep Conditioning Treatment', 'Intensive treatment for damaged hair', 'haircare', 32.00, 35, 'https://via.placeholder.com/300x250/ffd700/000000?text=Hair+Treatment'),
('product_010', 'Volumizing Spray', 'Lightweight spray for volume and shine', 'haircare', 22.00, 45, 'https://via.placeholder.com/300x250/ffd700/000000?text=Volume+Spray'),

('product_011', 'Rose Elegance', 'Luxurious rose-based perfume with floral notes', 'perfumes', 65.00, 15, 'https://via.placeholder.com/300x250/dda0dd/000000?text=Rose+Elegance'),
('product_012', 'Midnight Oud', 'Rich and mysterious oud fragrance', 'perfumes', 85.00, 10, 'https://via.placeholder.com/300x250/dda0dd/000000?text=Midnight+Oud'),
('product_013', 'Vanilla Dreams', 'Sweet and warm vanilla scent with amber notes', 'perfumes', 58.00, 18, 'https://via.placeholder.com/300x250/dda0dd/000000?text=Vanilla+Dreams'),
('product_014', 'Citrus Fresh', 'Energizing citrus fragrance for daily wear', 'perfumes', 45.00, 25, 'https://via.placeholder.com/300x250/dda0dd/000000?text=Citrus+Fresh'),
('product_015', 'Jasmine Night', 'Exotic jasmine with woody undertones', 'perfumes', 72.00, 12, 'https://via.placeholder.com/300x250/dda0dd/000000?text=Jasmine+Night');

-- ========================
-- Sample Activity Log
-- ========================
INSERT IGNORE INTO `activity_log` (`user_id`, `action`, `description`, `ip_address`) VALUES
('admin_001', 'database_setup', 'Initial database setup completed', '127.0.0.1'),
('admin_001', 'products_imported', 'Sample products imported successfully', '127.0.0.1');

-- ========================
-- Success Message
-- ========================
SELECT '✅ November Brands database setup complete!' AS message;
