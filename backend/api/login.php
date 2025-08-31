<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db.php';

$response = ['success' => false, 'message' => '', 'redirect' => ''];

// Get input data
$data = json_decode(file_get_contents('php://input'), true);

// Google Sign-In: If "google" key is set, handle Google login
if (!empty($data['google']) && !empty($data['email'])) {
    // Find user by email
    $stmt = $pdo->prepare("SELECT id, first_name, last_name, email, role, is_verified FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch();

    if (!$user) {
        $response['message'] = "No account found for this Google email. Please register first.";
        echo json_encode($response);
        exit;
    }

    // Check verification for contractor/architect
    if (($user['role'] === 'contractor' || $user['role'] === 'architect') && !$user['is_verified']) {
        $response['message'] = "Your account is pending admin verification.";
        $response['redirect'] = 'login';
        echo json_encode($response);
        exit;
    }

    // Start PHP session and set user session
    session_start();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['first_name'] = $user['first_name'];
    $_SESSION['last_name'] = $user['last_name'];

    $response['success'] = true;
    $response['message'] = "Login successful!";
    $response['user'] = [
        'id' => $user['id'],
        'first_name' => $user['first_name'],
        'last_name' => $user['last_name'],
        'email' => $user['email'],
        'role' => $user['role']
    ];
    
    // Set redirect based on role
    switch ($user['role']) {
        case 'homeowner':
            $response['redirect'] = 'homeowner-dashboard';
            break;
        case 'contractor':
            $response['redirect'] = 'contractor-dashboard';
            break;
        case 'architect':
            $response['redirect'] = 'architect-dashboard';
            break;
        default:
            $response['redirect'] = 'login';
    }
    
    echo json_encode($response);
    exit;
}

// Normal email/password login
if (empty($data['email']) || empty($data['password'])) {
    $response['message'] = "Email and password are required.";
    echo json_encode($response);
    exit;
}

// Check for admin login first
$adminUsername = 'shijinthomas369@gmail.com'; // Admin email
$adminPassword = 'admin123'; // Admin password

if ($data['email'] === $adminUsername && $data['password'] === $adminPassword) {
    // Start session for admin
    session_start();
    $_SESSION['admin_logged_in'] = true;
    $_SESSION['admin_username'] = 'admin';
    
    $response['success'] = true;
    $response['message'] = "Admin login successful!";
    $response['redirect'] = 'admin-dashboard';
    echo json_encode($response);
    exit;
}

// Allow any valid email domain for regular users
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    $response['message'] = "Invalid email address.";
    echo json_encode($response);
    exit;
}

// Find user
$stmt = $pdo->prepare("SELECT id, first_name, last_name, email, password, role, is_verified FROM users WHERE email = ?");
$stmt->execute([$data['email']]);
$user = $stmt->fetch();

if (!$user) {
    $response['message'] = "Invalid email or password.";
    echo json_encode($response);
    exit;
}

// Check password
if (!password_verify($data['password'], $user['password'])) {
    $response['message'] = "Invalid email or password.";
    echo json_encode($response);
    exit;
}

// Check verification for contractor/architect
if (($user['role'] === 'contractor' || $user['role'] === 'architect') && !$user['is_verified']) {
    $response['message'] = "Your account is pending admin verification.";
    $response['redirect'] = 'login';
    echo json_encode($response);
    exit;
}

// Start PHP session and set user session for regular login
session_start();
$_SESSION['user_id'] = $user['id'];
$_SESSION['role'] = $user['role'];
$_SESSION['first_name'] = $user['first_name'];
$_SESSION['last_name'] = $user['last_name'];

// Success: set redirect based on role
$response['success'] = true;
$response['message'] = "Login successful!";
$response['user'] = [
    'id' => $user['id'],
    'first_name' => $user['first_name'],
    'last_name' => $user['last_name'],
    'email' => $user['email'],
    'role' => $user['role']
];

// Set redirect based on role
switch ($user['role']) {
    case 'homeowner':
        $response['redirect'] = 'homeowner-dashboard';
        break;
    case 'contractor':
        $response['redirect'] = 'contractor-dashboard';
        break;
    case 'architect':
        $response['redirect'] = 'architect-dashboard';
        break;
    default:
        $response['redirect'] = 'login';
}

echo json_encode($response);