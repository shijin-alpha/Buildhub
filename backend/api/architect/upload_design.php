<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Get architect ID from session
    session_start();
    $architect_id = $_SESSION['user_id'] ?? null;

    if (!$architect_id) {
        echo json_encode([
            'success' => false,
            'message' => 'Architect not authenticated'
        ]);
        exit;
    }

    // Validate required fields (files required; title and target can be inferred)
    if (!isset($_FILES['design_files'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Missing required field: design_files'
        ]);
        exit;
    }

    $request_id = $_POST['request_id'] ?? null;
    $homeowner_id = $_POST['homeowner_id'] ?? null;
    $design_title = isset($_POST['design_title']) ? trim($_POST['design_title']) : '';
    $description = $_POST['description'] ?? '';
    $batch_id = $_POST['batch_id'] ?? null; // optional to group submissions

    // If neither request nor homeowner specified, try to infer from most recent assignment for this architect
    if (!$request_id && !$homeowner_id) {
        try {
            $inferSql = "SELECT layout_request_id, homeowner_id\n                         FROM layout_request_assignments\n                         WHERE architect_id = :aid AND status IN ('accepted','sent')\n                         ORDER BY updated_at DESC, created_at DESC\n                         LIMIT 1";
            $stmtInfer = $db->prepare($inferSql);
            $stmtInfer->execute([':aid' => $architect_id]);
            $row = $stmtInfer->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $request_id = $row['layout_request_id'];
                $homeowner_id = $row['homeowner_id'];
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'No assigned homeowner found to auto-route this design'
                ]);
                exit;
            }
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Auto-routing failed: ' . $e->getMessage()
            ]);
            exit;
        }
    }

    // Default title if not provided
    if ($design_title === '') {
        $design_title = 'Design ' . date('Y-m-d H:i');
    }

    // Create uploads directory if it doesn't exist
    $upload_dir = '../../uploads/designs/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    // Broad but safe allowlist (block executables/scripts)
    $allowed_types = [
        // Images
        'jpg','jpeg','png','gif','webp','svg','heic',
        // Documents
        'pdf','doc','docx','ppt','pptx','xls','xlsx','txt','rtf',
        // CAD / 3D
        'dwg','dxf','ifc','rvt','skp','3dm','obj','stl',
        // Archives
        'zip','rar','7z',
        // Video (for walkthroughs)
        'mp4','mov','avi','m4v'
    ];

    // Handle file uploads
    $uploaded_files = [];
    $files = $_FILES['design_files'];

    $handleUpload = function($name, $tmp) use ($allowed_types, $upload_dir, &$uploaded_files) {
        $file_ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));

        if (!in_array($file_ext, $allowed_types, true)) {
            throw new Exception('Invalid or unsupported file type: ' . $file_ext);
        }
        // Generate unique filename
        $unique_name = uniqid('', true) . '_' . time() . '.' . $file_ext;
        $file_path = $upload_dir . $unique_name;

        if (!move_uploaded_file($tmp, $file_path)) {
            throw new Exception('Failed to move uploaded file: ' . $name);
        }

        $uploaded_files[] = [
            'original' => $name,
            'stored' => $unique_name,
            'ext' => $file_ext,
            'path' => '/buildhub/backend' . str_replace('../../', '/', $file_path)
        ];
    };

    // Multiple vs single
    if (is_array($files['name'])) {
        for ($i = 0; $i < count($files['name']); $i++) {
            if ($files['error'][$i] === UPLOAD_ERR_OK) {
                $handleUpload($files['name'][$i], $files['tmp_name'][$i]);
            }
        }
    } else {
        if ($files['error'] === UPLOAD_ERR_OK) {
            $handleUpload($files['name'], $files['tmp_name']);
        }
    }

    if (empty($uploaded_files)) {
        echo json_encode([
            'success' => false,
            'message' => 'No files were uploaded successfully'
        ]);
        exit;
    }

    // Ensure designs table exists and has required columns
    $create_table_query = "CREATE TABLE IF NOT EXISTS designs (
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
    )";
    $db->exec($create_table_query);

    // Try to add missing columns or adjust enums if table pre-existed
    try { $db->exec("ALTER TABLE designs ADD COLUMN homeowner_id INT NULL"); } catch (Exception $e) {}
    try { $db->exec("ALTER TABLE designs ADD COLUMN batch_id VARCHAR(64) NULL"); } catch (Exception $e) {}
    // Try to widen status enum
    try { $db->exec("ALTER TABLE designs MODIFY COLUMN status ENUM('proposed','shortlisted','finalized') DEFAULT 'proposed'"); } catch (Exception $e) {}

    // Insert design record
    $files_json = json_encode($uploaded_files);

    $query = "INSERT INTO designs (layout_request_id, homeowner_id, architect_id, design_title, description, design_files, status, batch_id)
              VALUES (:request_id, :homeowner_id, :architect_id, :design_title, :description, :design_files, 'proposed', :batch_id)";

    $stmt = $db->prepare($query);
    if ($request_id !== null && $request_id !== '') {
        $stmt->bindValue(':request_id', (int)$request_id, PDO::PARAM_INT);
    } else {
        $stmt->bindValue(':request_id', null, PDO::PARAM_NULL);
    }
    if ($homeowner_id !== null && $homeowner_id !== '') {
        $stmt->bindValue(':homeowner_id', (int)$homeowner_id, PDO::PARAM_INT);
    } else {
        $stmt->bindValue(':homeowner_id', null, PDO::PARAM_NULL);
    }
    $stmt->bindValue(':architect_id', (int)$architect_id, PDO::PARAM_INT);
    $stmt->bindValue(':design_title', $design_title, PDO::PARAM_STR);
    $stmt->bindValue(':description', $description, PDO::PARAM_STR);
    $stmt->bindValue(':design_files', $files_json, PDO::PARAM_STR);
    if ($batch_id !== null && $batch_id !== '') {
        $stmt->bindValue(':batch_id', $batch_id, PDO::PARAM_STR);
    } else {
        $stmt->bindValue(':batch_id', null, PDO::PARAM_NULL);
    }

    if ($stmt->execute()) {
        $newId = $db->lastInsertId();
        // Lightweight debug log for verification
        try {
            @file_put_contents(__DIR__ . '/upload_debug.log', date('c') . " OK id=$newId aid=$architect_id hid=" . ($homeowner_id ?: 'null') . " rid=" . ($request_id ?: 'null') . "\n", FILE_APPEND);
        } catch (Exception $e) {}
        echo json_encode([
            'success' => true,
            'message' => 'Design uploaded successfully',
            'design_id' => $newId,
            'files' => $uploaded_files,
            'homeowner_id' => $homeowner_id,
            'request_id' => $request_id
        ]);
    } else {
        try {
            @file_put_contents(__DIR__ . '/upload_debug.log', date('c') . " FAIL aid=$architect_id hid=" . ($homeowner_id ?: 'null') . " rid=" . ($request_id ?: 'null') . "\n", FILE_APPEND);
        } catch (Exception $e) {}
        echo json_encode([
            'success' => false,
            'message' => 'Failed to save design record'
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error uploading design: ' . $e->getMessage()
    ]);
}
?>