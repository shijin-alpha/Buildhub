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

    // Ensure table exists (columns used below)
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

    // Accept multipart/form-data or JSON
    $raw = file_get_contents('php://input');
    $input = null;
    if (isset($_SERVER['CONTENT_TYPE']) && stripos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
        $input = json_decode($raw, true);
    }

    $id = null;
    $fields = [];

    if (is_array($input)) {
        $id = isset($input['id']) ? (int)$input['id'] : null;
        $fields = $input;
    } else {
        $id = isset($_POST['id']) ? (int)$_POST['id'] : null;
        $fields = $_POST;
    }

    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'Missing layout id']);
        exit;
    }

    // Ensure layout belongs to this architect
    $ownStmt = $db->prepare('SELECT * FROM layout_library WHERE id = :id AND architect_id = :aid');
    $ownStmt->execute([':id' => $id, ':aid' => $architect_id]);
    $existing = $ownStmt->fetch(PDO::FETCH_ASSOC);
    if (!$existing) {
        echo json_encode(['success' => false, 'message' => 'Layout not found or not owned by you']);
        exit;
    }

    $columns = [];
    $params = [':id' => $id];

    $map = [
        'title' => 'title',
        'layout_type' => 'layout_type',
        'bedrooms' => 'bedrooms',
        'bathrooms' => 'bathrooms',
        'area' => 'area',
        'description' => 'description',
        'price_range' => 'price_range',
        'status' => 'status'
    ];

    foreach ($map as $key => $col) {
        if (isset($fields[$key]) && $fields[$key] !== '') {
            $columns[] = "$col = :$key";
            // cast numbers
            if (in_array($key, ['bedrooms','bathrooms','area'])) {
                $params[":$key"] = (int)$fields[$key];
            } else {
                $params[":$key"] = $fields[$key];
            }
        }
    }

    // Handle optional image upload
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
        $columns[] = 'image_url = :image_url';
        $params[':image_url'] = '/buildhub/backend/uploads/designs/' . $safe;
    }

    // Handle optional design file upload
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
        $columns[] = 'design_file_url = :design_file_url';
        $params[':design_file_url'] = '/buildhub/backend/uploads/designs/' . $safe;
    }

    if (empty($columns)) {
        echo json_encode(['success' => false, 'message' => 'No changes provided']);
        exit;
    }

    $sql = 'UPDATE layout_library SET ' . implode(', ', $columns) . ' WHERE id = :id';
    $stmt = $db->prepare($sql);
    $ok = $stmt->execute($params);

    echo json_encode(['success' => (bool)$ok]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}