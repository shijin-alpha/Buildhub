<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Only POST method allowed']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['user_id']) || !isset($input['status'])) {
        echo json_encode(['success' => false, 'message' => 'User ID and status are required']);
        exit;
    }
    
    $userId = $input['user_id'];
    $newStatus = $input['status'];
    
    // Validate status
    $allowedStatuses = ['pending', 'approved', 'rejected', 'suspended'];
    if (!in_array($newStatus, $allowedStatuses)) {
        echo json_encode(['success' => false, 'message' => 'Invalid status']);
        exit;
    }
    
    // Check if user exists
    $checkQuery = "SELECT id, first_name, last_name, email, role, status FROM users WHERE id = :user_id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':user_id', $userId);
    $checkStmt->execute();
    
    $user = $checkStmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }
    
    // Update user status
    $updateQuery = "UPDATE users SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :user_id";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->bindParam(':status', $newStatus);
    $updateStmt->bindParam(':user_id', $userId);
    
    if ($updateStmt->execute()) {
        // Log the status change (optional - you can create an admin_logs table)
        $logQuery = "INSERT INTO admin_logs (action, user_id, details, created_at) 
                     VALUES ('status_change', :user_id, :details, CURRENT_TIMESTAMP)";
        
        try {
            // Create admin_logs table if it doesn't exist
            $createLogTable = "CREATE TABLE IF NOT EXISTS admin_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                action VARCHAR(100) NOT NULL,
                user_id INT NOT NULL,
                details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )";
            $db->exec($createLogTable);
            
            $logStmt = $db->prepare($logQuery);
            $logStmt->bindParam(':user_id', $userId);
            $logDetails = json_encode([
                'old_status' => $user['status'],
                'new_status' => $newStatus,
                'user_name' => $user['first_name'] . ' ' . $user['last_name'],
                'user_email' => $user['email'],
                'user_role' => $user['role']
            ]);
            $logStmt->bindParam(':details', $logDetails);
            $logStmt->execute();
        } catch (Exception $logError) {
            // Log error but don't fail the main operation
            error_log("Failed to log admin action: " . $logError->getMessage());
        }
        
        $statusMessages = [
            'approved' => 'User has been approved successfully',
            'rejected' => 'User has been rejected',
            'suspended' => 'User has been suspended',
            'pending' => 'User status has been reset to pending'
        ];
        
        echo json_encode([
            'success' => true,
            'message' => $statusMessages[$newStatus] ?? 'User status updated successfully',
            'user' => [
                'id' => $user['id'],
                'name' => $user['first_name'] . ' ' . $user['last_name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'old_status' => $user['status'],
                'new_status' => $newStatus
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update user status']);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error updating user status: ' . $e->getMessage()
    ]);
}
?>