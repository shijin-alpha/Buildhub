<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    session_start();
    $architect_id = $_SESSION['user_id'] ?? null;
    if (!$architect_id) {
        echo json_encode(['success' => false, 'message' => 'User not authenticated']);
        exit;
    }

    $db->exec("CREATE TABLE IF NOT EXISTS layout_library (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        layout_type VARCHAR(100) NOT NULL,
        bedrooms INT NOT NULL,
        bathrooms INT NOT NULL,
        area INT NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        design_file_url VARCHAR(500),
        price_range VARCHAR(100),
        architect_id INT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (architect_id) REFERENCES users(id)
    )");
    try { $db->exec("ALTER TABLE layout_library ADD COLUMN IF NOT EXISTS design_file_url VARCHAR(500) NULL AFTER image_url"); } catch (Exception $__) {}

    $stmt = $db->prepare("SELECT * FROM layout_library WHERE architect_id = :aid ORDER BY created_at DESC");
    $stmt->execute([':aid' => $architect_id]);

    $layouts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'layouts' => $layouts]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
