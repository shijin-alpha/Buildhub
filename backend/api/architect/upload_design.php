<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

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
    
    // Validate required fields
    if (!isset($_POST['request_id']) || !isset($_POST['design_title']) || !isset($_FILES['design_files'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Missing required fields'
        ]);
        exit;
    }
    
    $request_id = $_POST['request_id'];
    $design_title = $_POST['design_title'];
    $description = $_POST['description'] ?? '';
    
    // Create uploads directory if it doesn't exist
    $upload_dir = '../../uploads/designs/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    
    // Handle file uploads
    $uploaded_files = [];
    $files = $_FILES['design_files'];
    
    // Handle multiple files
    if (is_array($files['name'])) {
        for ($i = 0; $i < count($files['name']); $i++) {
            if ($files['error'][$i] === UPLOAD_ERR_OK) {
                $file_name = $files['name'][$i];
                $file_tmp = $files['tmp_name'][$i];
                $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
                
                // Validate file type
                $allowed_types = ['pdf', 'jpg', 'jpeg', 'png', 'dwg'];
                if (!in_array($file_ext, $allowed_types)) {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Invalid file type: ' . $file_ext
                    ]);
                    exit;
                }
                
                // Generate unique filename
                $unique_name = uniqid() . '_' . time() . '.' . $file_ext;
                $file_path = $upload_dir . $unique_name;
                
                if (move_uploaded_file($file_tmp, $file_path)) {
                    $uploaded_files[] = $unique_name;
                }
            }
        }
    } else {
        // Single file
        if ($files['error'] === UPLOAD_ERR_OK) {
            $file_name = $files['name'];
            $file_tmp = $files['tmp_name'];
            $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
            
            // Validate file type
            $allowed_types = ['pdf', 'jpg', 'jpeg', 'png', 'dwg'];
            if (!in_array($file_ext, $allowed_types)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid file type: ' . $file_ext
                ]);
                exit;
            }
            
            // Generate unique filename
            $unique_name = uniqid() . '_' . time() . '.' . $file_ext;
            $file_path = $upload_dir . $unique_name;
            
            if (move_uploaded_file($file_tmp, $file_path)) {
                $uploaded_files[] = $unique_name;
            }
        }
    }
    
    if (empty($uploaded_files)) {
        echo json_encode([
            'success' => false,
            'message' => 'No files were uploaded successfully'
        ]);
        exit;
    }
    
    // Create designs table if it doesn't exist
    $create_table_query = "CREATE TABLE IF NOT EXISTS designs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        layout_request_id INT NOT NULL,
        architect_id INT NOT NULL,
        design_title VARCHAR(255) NOT NULL,
        description TEXT,
        design_files TEXT,
        status ENUM('in-progress', 'approved', 'rejected') DEFAULT 'in-progress',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (layout_request_id) REFERENCES layout_requests(id),
        FOREIGN KEY (architect_id) REFERENCES users(id)
    )";
    $db->exec($create_table_query);
    
    // Insert design record
    $files_string = implode(',', $uploaded_files);
    
    $query = "INSERT INTO designs (layout_request_id, architect_id, design_title, description, design_files) 
              VALUES (:request_id, :architect_id, :design_title, :description, :design_files)";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':request_id', $request_id);
    $stmt->bindParam(':architect_id', $architect_id);
    $stmt->bindParam(':design_title', $design_title);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':design_files', $files_string);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Design uploaded successfully',
            'design_id' => $db->lastInsertId(),
            'files' => $uploaded_files
        ]);
    } else {
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