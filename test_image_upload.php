<?php
header('Content-Type: text/plain; charset=utf-8');

echo "=== اختبار إعدادات رفع الصور ===\n\n";

// Check PHP settings
echo "إعدادات PHP:\n";
echo "memory_limit: " . ini_get('memory_limit') . "\n";
echo "post_max_size: " . ini_get('post_max_size') . "\n";
echo "upload_max_filesize: " . ini_get('upload_max_filesize') . "\n";
echo "max_execution_time: " . ini_get('max_execution_time') . "\n";
echo "max_input_time: " . ini_get('max_input_time') . "\n\n";

// Check uploads directory
$uploadsDir = __DIR__ . '/uploads/';
echo "مجلد الصور:\n";
echo "المسار: " . $uploadsDir . "\n";
echo "موجود: " . (file_exists($uploadsDir) ? 'نعم' : 'لا') . "\n";
echo "قابل للكتابة: " . (is_writable($uploadsDir) ? 'نعم' : 'لا') . "\n";
echo "الصلاحيات: " . substr(sprintf('%o', fileperms($uploadsDir)), -4) . "\n\n";

// Check GD extension
echo "إضافات PHP:\n";
echo "GD Extension: " . (extension_loaded('gd') ? 'مفعل' : 'غير مفعل') . "\n";
echo "Imagick Extension: " . (extension_loaded('imagick') ? 'مفعل' : 'غير مفعل') . "\n\n";

// Test getimagesizefromstring function
echo "اختبار دالة getimagesizefromstring:\n";
echo "متاحة: " . (function_exists('getimagesizefromstring') ? 'نعم' : 'لا') . "\n\n";

// Test base64 functions
echo "اختبار دوال Base64:\n";
$testData = "test data";
$encoded = base64_encode($testData);
$decoded = base64_decode($encoded, true);
echo "تشفير Base64: " . ($encoded ? 'يعمل' : 'لا يعمل') . "\n";
echo "فك تشفير Base64: " . ($decoded === $testData ? 'يعمل' : 'لا يعمل') . "\n\n";

// Check if we can create a test file
echo "اختبار إنشاء ملف:\n";
$testFile = $uploadsDir . 'test_' . time() . '.txt';
try {
    $result = file_put_contents($testFile, 'test content');
    if ($result !== false) {
        echo "إنشاء ملف تجريبي: نجح (" . $result . " bytes)\n";
        unlink($testFile); // Delete test file
        echo "حذف الملف التجريبي: نجح\n";
    } else {
        echo "إنشاء ملف تجريبي: فشل\n";
    }
} catch (Exception $e) {
    echo "إنشاء ملف تجريبي: خطأ - " . $e->getMessage() . "\n";
}

echo "\n=== انتهى الاختبار ===\n";
?> 