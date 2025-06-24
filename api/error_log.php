<?php
function logError($error) {
    $logFile = __DIR__ . '/error.log';
    $timestamp = date('Y-m-d H:i:s');
    $errorMessage = "[{$timestamp}] {$error}\n";
    error_log($errorMessage, 3, $logFile);
}

function handleError($errno, $errstr, $errfile, $errline) {
    $error = "Error [{$errno}]: {$errstr} in {$errfile} on line {$errline}";
    logError($error);
    
    // Send JSON response for API errors
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred',
        'debug' => [
            'file' => basename($errfile),
            'line' => $errline,
            'type' => $errno,
            'message' => $errstr
        ]
    ]);
    
    exit(1);
}

function handleException($e) {
    $error = "Exception: {$e->getMessage()} in {$e->getFile()} on line {$e->getLine()}";
    logError($error);
    logError("Stack trace: " . $e->getTraceAsString());
    
    // Send JSON response for API exceptions
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'debug' => [
            'file' => basename($e->getFile()),
            'line' => $e->getLine(),
            'trace' => explode("\n", $e->getTraceAsString())
        ]
    ]);
    
    exit(1);
}

// Set error handlers
set_error_handler('handleError');
set_exception_handler('handleException');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log'); 