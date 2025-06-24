<?php
/**
 * Setup file for November Brands website
 * This file initializes the database and creates all necessary tables
 */

require_once 'config/database.php';

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Setup - NOVEMBER BRANDS</title>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #000000, #333333);
            color: white;
            padding: 2rem;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .setup-container {
            background: rgba(255, 255, 255, 0.1);
            padding: 3rem;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            max-width: 600px;
            width: 100%;
            text-align: center;
        }
        .brand-name {
            color: #ff1493;
            font-size: 2.5rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }
        .setup-status {
            margin: 2rem 0;
            padding: 1rem;
            border-radius: 10px;
            font-weight: 500;
        }
        .success {
            background: rgba(39, 174, 96, 0.2);
            border: 1px solid #27ae60;
            color: #2ecc71;
        }
        .error {
            background: rgba(231, 76, 60, 0.2);
            border: 1px solid #e74c3c;
            color: #e74c3c;
        }
        .info {
            background: rgba(52, 152, 219, 0.2);
            border: 1px solid #3498db;
            color: #3498db;
        }
        .setup-btn {
            background: linear-gradient(135deg, #ff1493, #c71585);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 10px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin: 1rem;
        }
        .setup-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(255, 20, 147, 0.4);
        }
        .setup-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .continue-btn {
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            text-decoration: none;
            display: inline-block;
        }
        .admin-info {
            background: rgba(255, 20, 147, 0.1);
            border: 1px solid #ff1493;
            border-radius: 10px;
            padding: 1.5rem;
            margin: 2rem 0;
            text-align: left;
        }
        .admin-info h3 {
            color: #ff1493;
            margin-bottom: 1rem;
        }
        .admin-credentials {
            font-family: 'Courier New', monospace;
            background: rgba(0, 0, 0, 0.3);
            padding: 1rem;
            border-radius: 5px;
            margin: 0.5rem 0;
        }
        .check-list {
            text-align: left;
            margin: 2rem 0;
        }
        .check-item {
            display: flex;
            align-items: center;
            margin: 1rem 0;
            padding: 0.5rem;
            border-radius: 5px;
        }
        .check-item.success {
            background: rgba(39, 174, 96, 0.2);
        }
        .check-item.error {
            background: rgba(231, 76, 60, 0.2);
        }
        .check-icon {
            margin-right: 1rem;
            font-size: 1.2rem;
        }
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="setup-container">
        <h1 class="brand-name">NOVEMBER BRANDS</h1>
        <p>Website Setup & Database Initialization</p>

        <?php
        $setupComplete = false;
        $errors = [];
        $success = [];

        // Check if setup was requested
        if (isset($_POST['setup'])) {
            try {
                // Initialize database
                if (initializeDatabase()) {
                    $success[] = "Database created and initialized successfully";
                    $success[] = "Sample products added to database";
                    $success[] = "Admin user created successfully";
                    $setupComplete = true;
                } else {
                    $errors[] = "Failed to initialize database";
                }
            } catch (Exception $e) {
                $errors[] = "Setup error: " . $e->getMessage();
            }
        }

        // Pre-setup checks
        $checks = [
            'PHP Version >= 7.4' => version_compare(PHP_VERSION, '7.4.0', '>='),
            'PDO Extension' => extension_loaded('pdo'),
            'PDO MySQL Extension' => extension_loaded('pdo_mysql'),
            'JSON Extension' => extension_loaded('json'),
            'Database Connection' => testConnection()
        ];
        ?>

        <div class="check-list">
            <h3>System Requirements Check</h3>
            <?php foreach ($checks as $check => $status): ?>
                <div class="check-item <?php echo $status ? 'success' : 'error'; ?>">
                    <span class="check-icon">
                        <i class="fas <?php echo $status ? 'fa-check-circle' : 'fa-times-circle'; ?>"></i>
                    </span>
                    <span><?php echo $check; ?></span>
                </div>
            <?php endforeach; ?>
        </div>

        <?php if (!empty($errors)): ?>
            <?php foreach ($errors as $error): ?>
                <div class="setup-status error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <?php echo htmlspecialchars($error); ?>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>

        <?php if (!empty($success)): ?>
            <?php foreach ($success as $msg): ?>
                <div class="setup-status success">
                    <i class="fas fa-check-circle"></i>
                    <?php echo htmlspecialchars($msg); ?>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>

        <?php if (!$setupComplete && array_product($checks)): ?>
            <div class="setup-status info">
                <i class="fas fa-info-circle"></i>
                Ready to setup November Brands website and database.
            </div>

            <form method="POST">
                <button type="submit" name="setup" class="setup-btn">
                    <i class="fas fa-rocket"></i>
                    Initialize Database & Setup
                </button>
            </form>

        <?php elseif (!array_product($checks)): ?>
            <div class="setup-status error">
                <i class="fas fa-exclamation-triangle"></i>
                Please fix the system requirements above before proceeding.
            </div>

        <?php else: ?>
            <div class="admin-info">
                <h3>Admin Account Information</h3>
                <p>Your admin account has been created successfully!</p>
                
                <div class="admin-credentials">
                    <strong>Status:</strong> Admin account initialized<br>
                    <strong>Access:</strong> Use your configured credentials to login
                </div>
                
                <p><strong>⚠️ Important:</strong> Please change the admin password after first login!</p>
            </div>

            <div class="setup-status success">
                <i class="fas fa-check-circle"></i>
                Setup completed successfully! Your website is ready.
            </div>

            <a href="index.html" class="setup-btn continue-btn">
                <i class="fas fa-home"></i>
                Go to Website
            </a>

            <a href="admin.html" class="setup-btn">
                <i class="fas fa-user-shield"></i>
                Admin Panel
            </a>
        <?php endif; ?>

        <div style="margin-top: 2rem; font-size: 0.9rem; opacity: 0.7;">
            <p>November Brands - Premium Beauty Products</p>
            <p>Setup by: Taghreed Nar</p>
        </div>
    </div>
</body>
</html> 