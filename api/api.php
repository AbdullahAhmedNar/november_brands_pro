<?php
// Simple API for login and admin functions
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Increase limits for image upload
ini_set('memory_limit', '256M');
ini_set('post_max_size', '50M');
ini_set('upload_max_filesize', '50M');
ini_set('max_execution_time', 300);
ini_set('max_input_time', 300);

// Start session only if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set JSON header
header('Content-Type: application/json; charset=utf-8');

// Database connection
function getConnection() {
    try {
        $pdo = new PDO(
            'mysql:host=localhost;dbname=november_brands;charset=utf8mb4',
            'root',
            '',
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        
        // Initialize admin if not exists (but keep credentials secure)
        initializeAdminIfNeeded($pdo);
        
        return $pdo;
    } catch (PDOException $e) {
        error_log('Database connection error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'خطأ في الاتصال بقاعدة البيانات']);
        exit;
    }
}

// Initialize admin account securely (backend only)
function initializeAdminIfNeeded($pdo) {
    try {
        // Check if admin exists
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE is_admin = 1");
        $stmt->execute();
        $adminCount = $stmt->fetchColumn();
        
        if ($adminCount == 0) {
            // Create admin account with secure credentials
            $adminId = 'admin_' . time() . '_' . uniqid();
            $adminEmail = 'taghreed@novemberbrands.com';
            $adminPassword = password_hash('November@2024', PASSWORD_DEFAULT);
            
            $stmt = $pdo->prepare("
                INSERT INTO users (user_id, first_name, last_name, email, password_hash, is_admin, is_verified, created_at) 
                VALUES (?, ?, ?, ?, ?, 1, 1, NOW())
            ");
            
            $stmt->execute([$adminId, 'Taghreed', 'Nar', $adminEmail, $adminPassword]);
            
            error_log('Admin account initialized successfully');
        }
    } catch (PDOException $e) {
        error_log('Admin initialization error: ' . $e->getMessage());
    }
}

// Get request data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Handle FormData requests (for file uploads)
if (empty($data) && !empty($_POST)) {
    $data = $_POST;
    error_log('API Request (FormData): ' . print_r($_POST, true));
    if (!empty($_FILES)) {
        error_log('Files received: ' . print_r($_FILES, true));
    }
} else {
    error_log('API Request (JSON): ' . $input);
}

// Handle different request types
if (isset($data['type'])) {
    switch ($data['type']) {
        case 'login':
            handleLogin($data);
            break;
        case 'register':
            handleRegister($data);
            break;
        case 'check_admin':
            handleCheckAdmin();
            break;
        case 'get_products':
            handleGetProducts($data);
            break;
        case 'delete_product':
            handleDeleteProduct($data);
            break;
        case 'get_product':
            handleGetProduct($data);
            break;
        case 'get_product_details':
            handleGetProductDetails($data);
            break;
        case 'update_product':
            handleUpdateProduct($data);
            break;
        case 'get_users':
            handleGetUsers($data);
            break;
        case 'delete_user':
            handleDeleteUser($data);
            break;
        case 'get_user_details':
            handleGetUserDetails($data);
            break;
        case 'logout':
            handleLogout();
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'نوع الطلب غير صالح']);
    }
} elseif (isset($data['action'])) {
    switch ($data['action']) {
        case 'add_product':
            handleAddProduct($data);
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'إجراء غير صالح']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'طلب غير صالح']);
}

function handleLogin($data) {
    $pdo = getConnection();
    
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'البريد الإلكتروني وكلمة المرور مطلوبان']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT user_id, email, password_hash, is_admin, first_name, last_name FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && password_verify($password, $user['password_hash'])) {
            $_SESSION['user_id'] = $user['user_id'];
            $_SESSION['is_admin'] = (bool)$user['is_admin'];
            $_SESSION['email'] = $user['email'];
            
            error_log('Login successful for: ' . $email . ', is_admin: ' . $user['is_admin']);
            
            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $user['user_id'],
                    'email' => $user['email'],
                    'firstName' => $user['first_name'],
                    'lastName' => $user['last_name'],
                    'name' => $user['first_name'] . ' ' . $user['last_name'],
                    'isAdmin' => (bool)$user['is_admin']
                ]
            ]);
        } else {
            error_log('Login failed for: ' . $email);
            echo json_encode(['success' => false, 'message' => 'بيانات الدخول غير صحيحة']);
        }
    } catch (PDOException $e) {
        error_log('Login database error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'خطأ في قاعدة البيانات']);
    }
}

function handleRegister($data) {
    $pdo = getConnection();
    
    $firstName = trim($data['firstName'] ?? '');
    $lastName = trim($data['lastName'] ?? '');
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $newsletter = isset($data['newsletter']) && $data['newsletter'];
    
    error_log('Registration attempt for: ' . $email);
    
    // Validate required fields
    if (empty($firstName) || empty($lastName) || empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'جميع الحقول مطلوبة']);
        return;
    }
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'صيغة البريد الإلكتروني غير صحيحة']);
        return;
    }
    
    // Validate password strength
    if (strlen($password) < 8) {
        echo json_encode(['success' => false, 'message' => 'كلمة المرور يجب أن تكون 8 أحرف على الأقل']);
        return;
    }
    
    try {
        // Check if user already exists
        $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'يوجد حساب مسجل بهذا البريد الإلكتروني من قبل']);
            return;
        }
        
        // Hash password
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        
        // Generate unique user_id
        $userId = 'user_' . time() . '_' . uniqid();
        
        // Insert new user
        $stmt = $pdo->prepare("
            INSERT INTO users (user_id, first_name, last_name, email, password_hash, is_admin, newsletter, created_at) 
            VALUES (?, ?, ?, ?, ?, 0, ?, NOW())
        ");
        
        if ($stmt->execute([$userId, $firstName, $lastName, $email, $passwordHash, $newsletter ? 1 : 0])) {
            $autoId = $pdo->lastInsertId();
            
            error_log('User registered successfully: ' . $email . ' (ID: ' . $userId . ')');
            
            echo json_encode([
                'success' => true,
                'message' => 'تم إنشاء الحساب بنجاح',
                'user' => [
                    'id' => $userId,
                    'firstName' => $firstName,
                    'lastName' => $lastName,
                    'email' => $email,
                    'isAdmin' => false
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'فشل في إنشاء الحساب']);
        }
        
    } catch (PDOException $e) {
        error_log('Registration database error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'خطأ في قاعدة البيانات']);
    }
}

function handleCheckAdmin() {
    $isAdmin = isset($_SESSION['is_admin']) && $_SESSION['is_admin'];
    
    // Enhanced debugging
    error_log('=== Admin Check Debug ===');
    error_log('Session ID: ' . session_id());
    error_log('Session data: ' . print_r($_SESSION, true));
    error_log('is_admin exists: ' . (isset($_SESSION['is_admin']) ? 'yes' : 'no'));
    error_log('is_admin value: ' . ($_SESSION['is_admin'] ?? 'not set'));
    error_log('Final result: ' . ($isAdmin ? 'true' : 'false'));
    error_log('=== End Debug ===');
    
    echo json_encode([
        'success' => $isAdmin,
        'isAdmin' => $isAdmin,
        'debug' => [
            'session_id' => session_id(),
            'session_exists' => !empty($_SESSION),
            'is_admin_set' => isset($_SESSION['is_admin']),
            'is_admin_value' => $_SESSION['is_admin'] ?? null
        ]
    ]);
}

function handleGetProducts($data) {
    $pdo = getConnection();
    
    $category = $data['category'] ?? null;
    
    try {
        if ($category) {
            // Get products by specific category
            $stmt = $pdo->prepare("
                SELECT product_id, name, description, category, price, stock_quantity, image_url, is_active 
                FROM products 
                WHERE category = ? AND is_active = 1 
                ORDER BY created_at DESC
            ");
            $stmt->execute([$category]);
        } else {
            // Get all products
            $stmt = $pdo->prepare("
                SELECT product_id, name, description, category, price, stock_quantity, image_url, is_active 
                FROM products 
                WHERE is_active = 1 
                ORDER BY category, created_at DESC
            ");
            $stmt->execute();
        }
        
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format products for frontend
        $formattedProducts = [];
        foreach ($products as $product) {
            $formattedProducts[] = [
                'id' => $product['product_id'],
                'name' => $product['name'],
                'description' => $product['description'],
                'price' => '$' . number_format($product['price'], 2),
                'image' => !empty($product['image_url']) ? $product['image_url'] : 'https://via.placeholder.com/300x250/ffb6c1/000000?text=' . urlencode($product['name']),
                'category' => $product['category'],
                'stock' => $product['stock_quantity']
            ];
        }
        
        echo json_encode([
            'success' => true,
            'products' => $formattedProducts,
            'count' => count($formattedProducts)
        ]);
        
    } catch (PDOException $e) {
        error_log('Get products database error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'خطأ في قاعدة البيانات']);
    }
}

function handleDeleteProduct($data) {
    // Check if user is admin
    if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
        echo json_encode(['success' => false, 'message' => 'يجب تسجيل الدخول كمسؤول لحذف المنتجات']);
        return;
    }
    
    $productId = $data['product_id'] ?? '';
    
    if (empty($productId)) {
        echo json_encode(['success' => false, 'message' => 'معرف المنتج مطلوب']);
        return;
    }
    
    $pdo = getConnection();
    
    try {
        // First, get the product details including image path
        $stmt = $pdo->prepare("SELECT name, image_url FROM products WHERE product_id = ?");
        $stmt->execute([$productId]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$product) {
            echo json_encode(['success' => false, 'message' => 'المنتج غير موجود']);
            return;
        }
        
        // Delete the product from database
        $stmt = $pdo->prepare("DELETE FROM products WHERE product_id = ?");
        $success = $stmt->execute([$productId]);
        
        if ($success && $stmt->rowCount() > 0) {
            // If product had an image, try to delete the image file
            if (!empty($product['image_url']) && strpos($product['image_url'], 'uploads/') === 0) {
                $imagePath = __DIR__ . '/../' . $product['image_url'];
                if (file_exists($imagePath)) {
                    @unlink($imagePath);
                    error_log('Deleted image file: ' . $imagePath);
                }
            }
            
            error_log('Product deleted successfully: ' . $product['name'] . ' (ID: ' . $productId . ')');
            echo json_encode([
                'success' => true,
                'message' => 'تم حذف المنتج بنجاح'
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'فشل في حذف المنتج']);
        }
        
    } catch (PDOException $e) {
        error_log('Delete product database error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'خطأ في قاعدة البيانات']);
    }
}

function handleGetProduct($data) {
    // Check if user is admin
    if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
        echo json_encode(['success' => false, 'message' => 'يجب تسجيل الدخول كمسؤول']);
        return;
    }
    
    $productId = $data['product_id'] ?? '';
    
    if (empty($productId)) {
        echo json_encode(['success' => false, 'message' => 'معرف المنتج مطلوب']);
        return;
    }
    
    $pdo = getConnection();
    
    try {
        $stmt = $pdo->prepare("
            SELECT product_id, name, description, category, price, stock_quantity, image_url, is_active, created_at, updated_at
            FROM products 
            WHERE product_id = ?
        ");
        $stmt->execute([$productId]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$product) {
            echo json_encode(['success' => false, 'message' => 'المنتج غير موجود']);
            return;
        }
        
        // Format product data
        $formattedProduct = [
            'id' => $product['product_id'],
            'name' => $product['name'],
            'description' => $product['description'],
            'category' => $product['category'],
            'price' => floatval($product['price']),
            'stock' => intval($product['stock_quantity']),
            'image_url' => $product['image_url'],
            'is_active' => boolval($product['is_active']),
            'created_at' => $product['created_at'],
            'updated_at' => $product['updated_at']
        ];
        
        echo json_encode([
            'success' => true,
            'product' => $formattedProduct
        ]);
        
    } catch (PDOException $e) {
        error_log('Get product database error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'خطأ في قاعدة البيانات']);
    }
}

function handleGetProductDetails($data) {
    // Check if user is admin
    if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
        echo json_encode(['success' => false, 'message' => 'يجب تسجيل الدخول كمسؤول']);
        return;
    }
    
    $productId = $data['product_id'] ?? '';
    
    if (empty($productId)) {
        echo json_encode(['success' => false, 'message' => 'معرف المنتج مطلوب']);
        return;
    }
    
    $pdo = getConnection();
    
    try {
        $stmt = $pdo->prepare("
            SELECT product_id, name, description, category, price, stock_quantity, image_url, is_active, created_at, updated_at
            FROM products 
            WHERE product_id = ?
        ");
        $stmt->execute([$productId]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$product) {
            echo json_encode(['success' => false, 'message' => 'المنتج غير موجود']);
            return;
        }
        
        // Format product data for editing
        $formattedProduct = [
            'id' => $product['product_id'],
            'name' => $product['name'],
            'description' => $product['description'],
            'category' => $product['category'],
            'price' => floatval($product['price']),
            'stock' => intval($product['stock_quantity']),
            'image_url' => $product['image_url'],
            'is_active' => boolval($product['is_active']),
            'created_at' => $product['created_at'],
            'updated_at' => $product['updated_at']
        ];
        
        echo json_encode([
            'success' => true,
            'product' => $formattedProduct
        ]);
        
    } catch (PDOException $e) {
        error_log('Get product details database error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'خطأ في قاعدة البيانات']);
    }
}

function handleUpdateProduct($data) {
    // Check if user is admin
    if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
        echo json_encode(['success' => false, 'message' => 'يجب تسجيل الدخول كمسؤول لتعديل المنتجات']);
        return;
    }
    
    $productId = $data['product_id'] ?? '';
    $name = trim($data['name'] ?? '');
    $category = $data['category'] ?? '';
    $price = floatval($data['price'] ?? 0);
    $stock = intval($data['stock'] ?? 0);
    $description = trim($data['description'] ?? '');
    
    if (empty($productId) || empty($name) || empty($category) || $price <= 0) {
        echo json_encode(['success' => false, 'message' => 'بيانات المنتج غير كاملة']);
        return;
    }
    
    $pdo = getConnection();
    
    try {
        // First, get current product data
        $stmt = $pdo->prepare("SELECT name, image_url FROM products WHERE product_id = ?");
        $stmt->execute([$productId]);
        $currentProduct = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$currentProduct) {
            echo json_encode(['success' => false, 'message' => 'المنتج غير موجود']);
            return;
        }
        
        $imageUrl = $currentProduct['image_url']; // Keep current image by default
        
        // Handle image update from FormData
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            error_log('Updating image for product: ' . $name);
            $newImageUrl = processFileUpload($_FILES['image'], $name);
            if ($newImageUrl === false) {
                error_log('Image upload failed for product update: ' . $name);
                echo json_encode(['success' => false, 'message' => 'فشل في معالجة الصورة الجديدة']);
                return;
            }
            
            // Delete old image if it exists and is local
            if (!empty($currentProduct['image_url']) && strpos($currentProduct['image_url'], 'uploads/') === 0) {
                $oldImagePath = __DIR__ . '/../' . $currentProduct['image_url'];
                if (file_exists($oldImagePath)) {
                    @unlink($oldImagePath);
                    error_log('Deleted old image: ' . $oldImagePath);
                }
            }
            
            $imageUrl = $newImageUrl;
            error_log('Image updated successfully. New URL: ' . $imageUrl);
        }
        
        // Update product in database
        $stmt = $pdo->prepare("
            UPDATE products 
            SET name = ?, category = ?, price = ?, stock_quantity = ?, description = ?, image_url = ?, updated_at = NOW()
            WHERE product_id = ?
        ");
        
        $success = $stmt->execute([$name, $category, $price, $stock, $description, $imageUrl, $productId]);
        
        if ($success && $stmt->rowCount() >= 0) { // >= 0 because even if no rows changed, it's still success
            error_log('Product updated successfully: ' . $name . ' (ID: ' . $productId . ')');
            echo json_encode([
                'success' => true,
                'message' => 'تم تحديث المنتج بنجاح',
                'product' => [
                    'id' => $productId,
                    'name' => $name,
                    'category' => $category,
                    'price' => $price,
                    'stock' => $stock,
                    'description' => $description,
                    'image_url' => $imageUrl
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'فشل في تحديث المنتج']);
        }
        
    } catch (PDOException $e) {
        error_log('Update product database error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()]);
    }
}

function handleGetUsers($data) {
    // Check if user is admin
    if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
        echo json_encode(['success' => false, 'message' => 'يجب تسجيل الدخول كمسؤول لعرض المستخدمين']);
        return;
    }
    
    $pdo = getConnection();
    
    try {
        // Get all users except the current admin
        $stmt = $pdo->prepare("
            SELECT user_id, first_name, last_name, email, phone, is_admin, is_verified, newsletter, created_at, updated_at
            FROM users 
            WHERE user_id != ? 
            ORDER BY created_at DESC
        ");
        $stmt->execute([$_SESSION['user_id'] ?? '']);
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format users for frontend (without sensitive data)
        $formattedUsers = [];
        foreach ($users as $user) {
            $formattedUsers[] = [
                'id' => $user['user_id'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name'],
                'full_name' => trim($user['first_name'] . ' ' . $user['last_name']),
                'contact_type' => !empty($user['email']) ? 'email' : 'phone',
                'is_admin' => boolval($user['is_admin']),
                'is_verified' => boolval($user['is_verified']),
                'newsletter' => boolval($user['newsletter']),
                'created_at' => $user['created_at'],
                'updated_at' => $user['updated_at'],
                'status' => 'مفعل', // جميع المستخدمين المسجلين في قاعدة البيانات مفعلون
                'role' => $user['is_admin'] ? 'مدير' : 'مستخدم عادي'
            ];
        }
        
        echo json_encode([
            'success' => true,
            'users' => $formattedUsers,
            'count' => count($formattedUsers)
        ]);
        
    } catch (PDOException $e) {
        error_log('Get users database error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'خطأ في قاعدة البيانات']);
    }
}

function handleDeleteUser($data) {
    // Check if user is admin
    if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
        echo json_encode(['success' => false, 'message' => 'يجب تسجيل الدخول كمسؤول لحذف المستخدمين']);
        return;
    }
    
    $userId = $data['user_id'] ?? '';
    
    if (empty($userId)) {
        echo json_encode(['success' => false, 'message' => 'معرف المستخدم مطلوب']);
        return;
    }
    
    // Prevent admin from deleting themselves
    if ($userId === ($_SESSION['user_id'] ?? '')) {
        echo json_encode(['success' => false, 'message' => 'لا يمكن حذف حسابك الشخصي']);
        return;
    }
    
    $pdo = getConnection();
    
    try {
        // First, get the user details
        $stmt = $pdo->prepare("SELECT first_name, last_name, email, is_admin FROM users WHERE user_id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'المستخدم غير موجود']);
            return;
        }
        
        // Prevent deleting other admins (additional security)
        if ($user['is_admin']) {
            echo json_encode(['success' => false, 'message' => 'لا يمكن حذف حساب مدير آخر']);
            return;
        }
        
        // Delete the user from database
        $stmt = $pdo->prepare("DELETE FROM users WHERE user_id = ?");
        $success = $stmt->execute([$userId]);
        
        if ($success && $stmt->rowCount() > 0) {
            $userName = trim($user['first_name'] . ' ' . $user['last_name']);
            error_log('User deleted successfully: ' . $userName . ' (ID: ' . $userId . ')');
            echo json_encode([
                'success' => true,
                'message' => 'تم حذف المستخدم بنجاح',
                'deleted_user' => $userName
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'فشل في حذف المستخدم']);
        }
        
    } catch (PDOException $e) {
        error_log('Delete user database error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'خطأ في قاعدة البيانات']);
    }
}

function handleGetUserDetails($data) {
    // Check if user is admin
    if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
        echo json_encode(['success' => false, 'message' => 'يجب تسجيل الدخول كمسؤول لعرض تفاصيل المستخدمين']);
        return;
    }
    
    $userId = $data['user_id'] ?? '';
    
    if (empty($userId)) {
        echo json_encode(['success' => false, 'message' => 'معرف المستخدم مطلوب']);
        return;
    }
    
    $pdo = getConnection();
    
    try {
        // Get user details
        $stmt = $pdo->prepare("
            SELECT user_id, first_name, last_name, email, phone, is_admin, is_verified, newsletter, created_at, updated_at
            FROM users 
            WHERE user_id = ?
        ");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'المستخدم غير موجود']);
            return;
        }
        
        // Format user data for frontend (without sensitive data)
        $formattedUser = [
            'id' => $user['user_id'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'full_name' => trim($user['first_name'] . ' ' . $user['last_name']),
            'contact_type' => !empty($user['email']) ? 'email' : 'phone',
            'is_admin' => boolval($user['is_admin']),
            'is_verified' => boolval($user['is_verified']),
            'newsletter' => boolval($user['newsletter']),
            'created_at' => $user['created_at'],
            'updated_at' => $user['updated_at'],
            'status' => 'مفعل', // جميع المستخدمين المسجلين في قاعدة البيانات مفعلون
            'role' => $user['is_admin'] ? 'مدير' : 'مستخدم عادي'
        ];
        
        echo json_encode([
            'success' => true,
            'user' => $formattedUser
        ]);
        
    } catch (PDOException $e) {
        error_log('Get user details database error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'خطأ في قاعدة البيانات']);
    }
}

function handleLogout() {
    try {
        // Destroy all session data
        $_SESSION = array();
        
        // If it's desired to kill the session cookie as well
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        
        // Destroy the session
        session_destroy();
        
        error_log('User logged out successfully');
        
        echo json_encode([
            'success' => true,
            'message' => 'تم تسجيل الخروج بنجاح'
        ]);
        
    } catch (Exception $e) {
        error_log('Logout error: ' . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'خطأ في تسجيل الخروج'
        ]);
    }
}

function handleAddProduct($data) {
    if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
        echo json_encode(['success' => false, 'message' => 'يجب تسجيل الدخول كمسؤول']);
        return;
    }
    
    $pdo = getConnection();
    
    $name = $data['name'] ?? '';
    $category = $data['category'] ?? '';
    $price = floatval($data['price'] ?? 0);
    $stock = intval($data['stock'] ?? 0);
    $description = $data['description'] ?? '';
    $imageBase64 = $data['image'] ?? '';
    
    if (empty($name) || empty($category) || $price <= 0) {
        echo json_encode(['success' => false, 'message' => 'بيانات المنتج غير كاملة']);
        return;
    }
    
    // Handle image upload
    $imageUrl = '';
    if (!empty($imageBase64)) {
        error_log('Starting image upload process for product: ' . $name);
        $imageUrl = processImageUpload($imageBase64, $name);
        if ($imageUrl === false) {
            error_log('Image upload failed for product: ' . $name);
            echo json_encode(['success' => false, 'message' => 'فشل في معالجة الصورة. يرجى التأكد من صحة الصورة وحجمها.']);
            return;
        }
        error_log('Image upload successful. URL: ' . $imageUrl);
    } else {
        error_log('No image provided for product: ' . $name);
    }
    
    try {
        // Generate unique product_id
        $productId = 'product_' . time() . '_' . uniqid();
        
        $stmt = $pdo->prepare("
            INSERT INTO products (product_id, name, category, price, stock_quantity, description, image_url, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        
        if ($stmt->execute([$productId, $name, $category, $price, $stock, $description, $imageUrl])) {
            error_log('Product added successfully: ' . $name . ' (ID: ' . $productId . ')');
            echo json_encode([
                'success' => true, 
                'message' => 'تم إضافة المنتج بنجاح',
                'product' => [
                    'id' => $productId,
                    'name' => $name,
                    'category' => $category,
                    'price' => $price,
                    'stock' => $stock,
                    'image_url' => $imageUrl
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'فشل في إضافة المنتج']);
        }
    } catch (PDOException $e) {
        error_log('Add product database error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()]);
    }
}

function processFileUpload($fileInfo, $productName) {
    try {
        error_log('Processing file upload for product: ' . $productName);
        error_log('File info: ' . print_r($fileInfo, true));
        
        // Check if file was uploaded successfully
        if (!isset($fileInfo['tmp_name']) || !is_uploaded_file($fileInfo['tmp_name'])) {
            error_log('Invalid uploaded file');
            return false;
        }
        
        // Check file size (10MB max)
        if ($fileInfo['size'] > 10 * 1024 * 1024) {
            error_log('File size exceeds 10MB limit: ' . $fileInfo['size'] . ' bytes');
            return false;
        }
        
        // Get file extension from mime type
        $allowedTypes = [
            'image/jpeg' => 'jpg',
            'image/jpg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp'
        ];
        
        $mimeType = mime_content_type($fileInfo['tmp_name']);
        if (!isset($allowedTypes[$mimeType])) {
            error_log('Invalid file type: ' . $mimeType);
            return false;
        }
        
        $fileExtension = $allowedTypes[$mimeType];
        error_log('Detected file type: ' . $mimeType . ' -> ' . $fileExtension);
        
        // Validate that it's actually an image
        $imageInfo = @getimagesize($fileInfo['tmp_name']);
        if ($imageInfo === false) {
            error_log('Invalid image file');
            return false;
        }
        
        error_log('Image dimensions: ' . $imageInfo[0] . 'x' . $imageInfo[1]);
        
        // Create uploads directory if it doesn't exist
        $uploadDir = __DIR__ . '/../uploads/';
        if (!file_exists($uploadDir)) {
            error_log('Creating uploads directory: ' . $uploadDir);
            if (!mkdir($uploadDir, 0755, true)) {
                error_log('Failed to create uploads directory');
                return false;
            }
        }
        
        // Check if directory is writable
        if (!is_writable($uploadDir)) {
            error_log('Uploads directory is not writable: ' . $uploadDir);
            return false;
        }
        
        // Generate unique filename
        $fileName = 'product_' . time() . '_' . uniqid() . '.' . $fileExtension;
        $uploadPath = $uploadDir . $fileName;
        
        error_log('Moving uploaded file to: ' . $uploadPath);
        
        // Move uploaded file
        if (move_uploaded_file($fileInfo['tmp_name'], $uploadPath)) {
            // Set proper permissions
            chmod($uploadPath, 0644);
            $relativePath = 'uploads/' . $fileName;
            error_log('File upload completed successfully: ' . $relativePath);
            return $relativePath;
        } else {
            error_log('Failed to move uploaded file');
            return false;
        }
        
    } catch (Exception $e) {
        error_log('File processing exception: ' . $e->getMessage());
        error_log('Stack trace: ' . $e->getTraceAsString());
        return false;
    }
}

function processImageUpload($imageBase64, $productName) {
    try {
        error_log('Processing image upload for product: ' . $productName);
        error_log('Image data length: ' . strlen($imageBase64));
        
        // Check if image data is provided
        if (empty($imageBase64)) {
            error_log('No image data provided');
            return '';
        }
        
        // Validate base64 image format
        if (!preg_match('/^data:image\/(jpeg|jpg|png|gif|webp);base64,/', $imageBase64)) {
            error_log('Invalid image format. Expected: data:image/(jpeg|jpg|png|gif|webp);base64,');
            error_log('Received format: ' . substr($imageBase64, 0, 50));
            return false;
        }
        
        // Extract image data
        $imageData = explode(',', $imageBase64, 2);
        if (count($imageData) !== 2) {
            error_log('Invalid base64 image data structure');
            return false;
        }
        
        // Get image type
        preg_match('/^data:image\/(jpeg|jpg|png|gif|webp);base64,/', $imageData[0], $matches);
        $imageType = isset($matches[1]) ? $matches[1] : 'jpg';
        error_log('Detected image type: ' . $imageType);
        
        // Decode base64
        $imageContent = base64_decode($imageData[1], true);
        if ($imageContent === false) {
            error_log('Failed to decode base64 image');
            return false;
        }
        
        // Validate image size (10MB max)
        $imageSize = strlen($imageContent);
        error_log('Image size after decode: ' . $imageSize . ' bytes');
        if ($imageSize > 10 * 1024 * 1024) {
            error_log('Image size exceeds 10MB limit');
            return false;
        }
        
        // Validate that it's actually an image
        $imageInfo = @getimagesizefromstring($imageContent);
        if ($imageInfo === false) {
            error_log('Invalid image content - not a valid image file');
            return false;
        }
        
        error_log('Image dimensions: ' . $imageInfo[0] . 'x' . $imageInfo[1]);
        
        // Create uploads directory if it doesn't exist
        $uploadDir = __DIR__ . '/../uploads/';
        if (!file_exists($uploadDir)) {
            error_log('Creating uploads directory: ' . $uploadDir);
            if (!mkdir($uploadDir, 0755, true)) {
                error_log('Failed to create uploads directory');
                return false;
            }
        }
        
        // Check if directory is writable
        if (!is_writable($uploadDir)) {
            error_log('Uploads directory is not writable: ' . $uploadDir);
            return false;
        }
        
        // Generate unique filename
        $fileExtension = ($imageType === 'jpeg') ? 'jpg' : $imageType;
        $fileName = 'product_' . time() . '_' . uniqid() . '.' . $fileExtension;
        $uploadPath = $uploadDir . $fileName;
        
        error_log('Saving image to: ' . $uploadPath);
        
        // Save image file
        $bytesWritten = file_put_contents($uploadPath, $imageContent);
        if ($bytesWritten === false) {
            error_log('Failed to save image file to: ' . $uploadPath);
            return false;
        }
        
        error_log('Image saved successfully. Bytes written: ' . $bytesWritten);
        
        // Set proper permissions
        if (file_exists($uploadPath)) {
            chmod($uploadPath, 0644);
            $relativePath = 'uploads/' . $fileName;
            error_log('Image upload completed successfully: ' . $relativePath);
            return $relativePath;
        } else {
            error_log('File was not created successfully');
            return false;
        }
        
    } catch (Exception $e) {
        error_log('Image processing exception: ' . $e->getMessage());
        error_log('Stack trace: ' . $e->getTraceAsString());
        return false;
    }
}
?> 