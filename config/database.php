<?php
// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', '');
define('DB_NAME', 'november_brands');

// Create connection
function getConnection() {
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USERNAME,
            DB_PASSWORD,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
        return $pdo;
    } catch(PDOException $e) {
        error_log("Connection failed: " . $e->getMessage());
        die("Database connection failed. Please try again later.");
    }
}

// Initialize database
function initializeDatabase() {
    try {
        // First, create database if it doesn't exist
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";charset=utf8mb4",
            DB_USERNAME,
            DB_PASSWORD,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        
        $pdo->exec("CREATE DATABASE IF NOT EXISTS " . DB_NAME . " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $pdo->exec("USE " . DB_NAME);
        
        // Create tables
        createTables($pdo);
        
        // Insert sample data
        insertSampleData($pdo);
        
        return true;
    } catch(PDOException $e) {
        error_log("Database initialization failed: " . $e->getMessage());
        return false;
    }
}

function createTables($pdo) {
    // Users table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(50) UNIQUE NOT NULL,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE,
            phone VARCHAR(20) UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            is_admin BOOLEAN DEFAULT FALSE,
            is_verified BOOLEAN DEFAULT FALSE,
            newsletter BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_email (email),
            INDEX idx_phone (phone),
            INDEX idx_user_id (user_id)
        )
    ");
    
    // Products table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            category ENUM('skincare', 'haircare', 'perfumes') NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            stock_quantity INT DEFAULT 0,
            image_url VARCHAR(500),
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_category (category),
            INDEX idx_product_id (product_id),
            INDEX idx_active (is_active)
        )
    ");
    
    // Orders table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id VARCHAR(50) UNIQUE NOT NULL,
            user_id VARCHAR(50) NOT NULL,
            total_amount DECIMAL(10, 2) NOT NULL,
            status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
            customer_name VARCHAR(200) NOT NULL,
            customer_email VARCHAR(255),
            customer_phone VARCHAR(20),
            shipping_address TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_user_id (user_id),
            INDEX idx_order_id (order_id),
            INDEX idx_status (status)
        )
    ");
    
    // Order items table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS order_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id VARCHAR(50) NOT NULL,
            product_id VARCHAR(50) NOT NULL,
            quantity INT NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_order_id (order_id),
            INDEX idx_product_id (product_id)
        )
    ");
    
    // Favorites table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS favorites (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(50) NOT NULL,
            product_id VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_favorite (user_id, product_id),
            INDEX idx_user_id (user_id),
            INDEX idx_product_id (product_id)
        )
    ");
    
    // Cart table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS cart (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(50) NOT NULL,
            product_id VARCHAR(50) NOT NULL,
            quantity INT NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_cart_item (user_id, product_id),
            INDEX idx_user_id (user_id),
            INDEX idx_product_id (product_id)
        )
    ");
    
    // Activity log table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS activity_log (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(50),
            action VARCHAR(100) NOT NULL,
            description TEXT,
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_id (user_id),
            INDEX idx_action (action)
        )
    ");
}

function insertSampleData($pdo) {
    // Check if admin user exists
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE is_admin = TRUE");
    $stmt->execute();
    $adminCount = $stmt->fetchColumn();
    
    if ($adminCount == 0) {
        // Admin user creation is now handled by the main API
        // for better security - no hardcoded credentials in config files
    }
    
    // Check if sample products exist
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM products");
    $stmt->execute();
    $productCount = $stmt->fetchColumn();
    
    if ($productCount == 0) {
        // Insert sample products
        $sampleProducts = [
            // Skincare products
            [
                'product_001', 'Vitamin C Serum', 'Brightening serum with 20% Vitamin C for radiant skin',
                'skincare', 45.00, 50, 'https://via.placeholder.com/300x250/ffb6c1/000000?text=Vitamin+C+Serum'
            ],
            [
                'product_002', 'Hyaluronic Acid Moisturizer', 'Deep hydrating moisturizer for all skin types',
                'skincare', 38.00, 30, 'https://via.placeholder.com/300x250/ffb6c1/000000?text=Hyaluronic+Moisturizer'
            ],
            [
                'product_003', 'Retinol Night Cream', 'Anti-aging night cream with retinol for smooth skin',
                'skincare', 52.00, 25, 'https://via.placeholder.com/300x250/ffb6c1/000000?text=Retinol+Cream'
            ],
            
            // Haircare products
            [
                'product_004', 'Argan Oil Hair Mask', 'Nourishing hair mask with organic argan oil',
                'haircare', 35.00, 40, 'https://via.placeholder.com/300x250/ffd700/000000?text=Argan+Hair+Mask'
            ],
            [
                'product_005', 'Keratin Shampoo', 'Strengthening shampoo with keratin complex',
                'haircare', 28.00, 60, 'https://via.placeholder.com/300x250/ffd700/000000?text=Keratin+Shampoo'
            ],
            [
                'product_006', 'Hair Growth Serum', 'Advanced serum to promote healthy hair growth',
                'haircare', 48.00, 20, 'https://via.placeholder.com/300x250/ffd700/000000?text=Growth+Serum'
            ],
            
            // Perfumes
            [
                'product_007', 'Rose Elegance', 'Luxurious rose-based perfume with floral notes',
                'perfumes', 65.00, 15, 'https://via.placeholder.com/300x250/dda0dd/000000?text=Rose+Elegance'
            ],
            [
                'product_008', 'Midnight Oud', 'Rich and mysterious oud fragrance',
                'perfumes', 85.00, 10, 'https://via.placeholder.com/300x250/dda0dd/000000?text=Midnight+Oud'
            ],
            [
                'product_009', 'Vanilla Dreams', 'Sweet and warm vanilla scent with amber notes',
                'perfumes', 58.00, 18, 'https://via.placeholder.com/300x250/dda0dd/000000?text=Vanilla+Dreams'
            ]
        ];
        
        $stmt = $pdo->prepare("
            INSERT INTO products (product_id, name, description, category, price, stock_quantity, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($sampleProducts as $product) {
            $stmt->execute($product);
        }
    }
}

// Test connection function
function testConnection() {
    try {
        $pdo = getConnection();
        return $pdo ? true : false;
    } catch (Exception $e) {
        return false;
    }
}
?> 