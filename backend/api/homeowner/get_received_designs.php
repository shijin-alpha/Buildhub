<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    session_start();
    $user_id = $_SESSION['user_id'] ?? null; // homeowner id

    if (!$user_id) {
        echo json_encode(['success' => false, 'message' => 'User not authenticated']);
        exit;
    }

    // Ensure designs table exists to avoid errors on fresh DBs
    $db->exec("CREATE TABLE IF NOT EXISTS designs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        layout_request_id INT NULL,
        homeowner_id INT NULL,
        architect_id INT NOT NULL,
        design_title VARCHAR(255) NOT NULL,
        description TEXT,
        design_files TEXT,
        status ENUM('proposed','shortlisted','finalized') DEFAULT 'proposed',
        batch_id VARCHAR(64) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");

    $sql = "SELECT d.*, a.first_name AS architect_first_name, a.last_name AS architect_last_name, a.email AS architect_email
            FROM designs d
            JOIN users a ON d.architect_id = a.id
            WHERE d.homeowner_id = :uid1
               OR d.layout_request_id IN (SELECT lr.id FROM layout_requests lr WHERE lr.homeowner_id = :uid2)
            ORDER BY d.created_at DESC";

    $stmt = $db->prepare($sql);
    $stmt->bindParam(':uid1', $user_id, PDO::PARAM_INT);
    $stmt->bindParam(':uid2', $user_id, PDO::PARAM_INT);
    $stmt->execute();

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $designs = [];

    foreach ($rows as $row) {
        $files = json_decode($row['design_files'], true);
        if (!is_array($files)) {
            // Backward-compat: comma-separated list
            $files = array_filter(array_map('trim', explode(',', (string)$row['design_files'])));
            $files = array_map(function($name){
                return [
                    'original' => $name,
                    'stored' => $name,
                    'ext' => strtolower(pathinfo($name, PATHINFO_EXTENSION)),
                    'path' => '/buildhub/backend/uploads/designs/' . $name
                ];
            }, $files);
        }

        $designs[] = [
            'id' => (int)$row['id'],
            'layout_request_id' => $row['layout_request_id'] ? (int)$row['layout_request_id'] : null,
            'homeowner_id' => $row['homeowner_id'] ? (int)$row['homeowner_id'] : null,
            'architect_id' => (int)$row['architect_id'],
            'design_title' => $row['design_title'],
            'description' => $row['description'],
            'files' => $files,
            'status' => $row['status'],
            'batch_id' => $row['batch_id'],
            'architect' => [
                'name' => trim(($row['architect_first_name'] ?? '') . ' ' . ($row['architect_last_name'] ?? '')),
                'email' => $row['architect_email'] ?? null
            ],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at']
        ];
    }

    echo json_encode(['success' => true, 'designs' => $designs]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error fetching designs: ' . $e->getMessage()]);
}