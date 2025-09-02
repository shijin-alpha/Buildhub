<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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

    // Ensure table exists
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
    // Ensure new column exists on older tables
    try { $db->exec("ALTER TABLE layout_library ADD COLUMN IF NOT EXISTS design_file_url VARCHAR(500) NULL AFTER image_url"); } catch (Exception $__) {}

    $input = $_POST;

    $title = trim($input['title'] ?? '');
    $layout_type = trim($input['layout_type'] ?? '');
    $bedrooms = isset($input['bedrooms']) ? (int)$input['bedrooms'] : 0;
    $bathrooms = isset($input['bathrooms']) ? (int)$input['bathrooms'] : 0;
    $area = isset($input['area']) ? (int)$input['area'] : 0;
    $description = trim($input['description'] ?? '');
    $price_range = trim($input['price_range'] ?? '');

    if ($title === '' || $layout_type === '' || $bedrooms <= 0 || $bathrooms <= 0 || $area <= 0) {
        echo json_encode(['success' => false, 'message' => 'Missing or invalid fields']);
        exit;
    }

    // Handle image upload (optional). Expect field name 'image'
    $image_url = null;
    if (!empty($_FILES['image']['name'])) {
        $dir = __DIR__ . '/../../uploads/designs';
        if (!is_dir($dir)) { @mkdir($dir, 0777, true); }
        $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
        $safe = 'lib_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $dest = $dir . '/' . $safe;
        if (!move_uploaded_file($_FILES['image']['tmp_name'], $dest)) {
            echo json_encode(['success' => false, 'message' => 'Failed to save image']);
            exit;
        }
        $image_url = '/buildhub/backend/uploads/designs/' . $safe;
    }

    // Handle layout design file upload (optional). Expect field name 'design_file'
    $design_file_url = null;
    if (!empty($_FILES['design_file']['name'])) {
        $dir = __DIR__ . '/../../uploads/designs';
        if (!is_dir($dir)) { @mkdir($dir, 0777, true); }
        $ext = strtolower(pathinfo($_FILES['design_file']['name'], PATHINFO_EXTENSION));
        $safe = 'libfile_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $dest = $dir . '/' . $safe;
        if (!move_uploaded_file($_FILES['design_file']['tmp_name'], $dest)) {
            echo json_encode(['success' => false, 'message' => 'Failed to save design file']);
            exit;
        }
        $design_file_url = '/buildhub/backend/uploads/designs/' . $safe;
    }

    $stmt = $db->prepare("INSERT INTO layout_library (title, layout_type, bedrooms, bathrooms, area, description, image_url, design_file_url, price_range, architect_id)
                          VALUES (:title, :layout_type, :bedrooms, :bathrooms, :area, :description, :image_url, :design_file_url, :price_range, :architect_id)");
    $ok = $stmt->execute([
        ':title' => $title,
        ':layout_type' => $layout_type,
        ':bedrooms' => $bedrooms,
        ':bathrooms' => $bathrooms,
        ':area' => $area,
        ':description' => $description,
        ':image_url' => $image_url,
        ':design_file_url' => $design_file_url,
        ':price_range' => $price_range,
        ':architect_id' => $architect_id
    ]);

    if ($ok) {
        echo json_encode(['success' => true, 'layout_id' => $db->lastInsertId()]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to create layout']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}