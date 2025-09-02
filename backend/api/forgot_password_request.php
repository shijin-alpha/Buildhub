<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once '../config/db.php';
require_once '../utils/send_mail.php';
require_once '../config/email_config.php';

$response = ['success' => false, 'message' => ''];

try {
    $data = json_decode(file_get_contents('php://input'), true) ?: [];
    $email = trim($data['email'] ?? '');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['message'] = 'Enter a valid email address.';
        echo json_encode($response); exit;
    }

    // Find user
    $stmt = $pdo->prepare('SELECT id, email FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // For security: return success even if user not found
    if (!$user) {
        $response['success'] = true;
        $response['message'] = 'If an account exists, a reset link has been sent.';
        echo json_encode($response); exit;
    }

    // Create token (store hash)
    $tokenPlain = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', $tokenPlain);
    $expires = (new DateTime('+1 hour'))->format('Y-m-d H:i:s');

    // Ensure table exists (optional safety)
    $pdo->exec("CREATE TABLE IF NOT EXISTS password_resets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      email VARCHAR(255) NOT NULL,
      token_hash VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      used TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (email), INDEX (user_id), INDEX (expires_at)
    )");

    // Invalidate old tokens for this user/email
    $pdo->prepare('UPDATE password_resets SET used = 1 WHERE email = ?')->execute([$email]);

    // Insert token
    $ins = $pdo->prepare('INSERT INTO password_resets (user_id, email, token_hash, expires_at) VALUES (?, ?, ?, ?)');
    $ins->execute([$user['id'], $email, $tokenHash, $expires]);

    // Build reset link
    $baseUrl = defined('WEBSITE_URL') ? WEBSITE_URL : 'http://localhost:3000';
    $resetUrl = $baseUrl . '/reset-password?token=' . urlencode($tokenPlain) . '&email=' . urlencode($email);

    // Email content (includes both link and copy-paste code option)
    $subject = 'Reset your BuildHub password';
    $message = '<p>Hello,</p>
               <p>We received a request to reset your BuildHub account password.</p>
               <p>You can reset your password in either of these ways:</p>
               <ol>
                 <li>Click this link (if your site is running):<br>
                   <a href="' . htmlspecialchars($resetUrl) . '">' . htmlspecialchars($resetUrl) . '</a>
                 </li>
                 <li>If the link doesn\'t open (e.g., site not hosted), copy this code and use it in the app\'s "Reset Password" screen:<br>
                   <strong>Reset Code:</strong> ' . htmlspecialchars($tokenPlain) . '<br>
                   <small>Tip: In the app, enter your email and this code to verify, then set a new password.</small>
                 </li>
               </ol>
               <p>This code/link will expire in 1 hour. If you did not request this, you can ignore this email.</p>
               <p>— BuildHub</p>';

    // Send email
    $sent = sendMail($email, $subject, $message);

    if (!$sent) {
        $response['message'] = 'Failed to send reset email. Please try again later.';
        echo json_encode($response); exit;
    }

    $response['success'] = true;
    $response['message'] = 'If an account exists, a reset link has been sent.';
    echo json_encode($response);

} catch (Exception $e) {
    $response['message'] = 'Server error. Please try again.';
    echo json_encode($response);
}