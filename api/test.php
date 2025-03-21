<?php
// Set headers to allow cross-origin requests and specify content type
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// If it's an OPTIONS request, just return headers and exit
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Simple test endpoint to check if the API is accessible
echo json_encode([
    'success' => true,
    'message' => 'API is accessible',
    'timestamp' => time(),
    'server_info' => [
        'php_version' => phpversion(),
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    ]
]);