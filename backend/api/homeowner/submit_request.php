<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get homeowner ID from session
    session_start();
    $homeowner_id = $_SESSION['user_id'] ?? null;
    
    if (!$homeowner_id) {
        echo json_encode([
            'success' => false,
            'message' => 'User not authenticated'
        ]);
        exit;
    }
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (!isset($input['plot_size']) || !isset($input['budget_range'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Missing required fields'
        ]);
        exit;
    }
    
    $plot_size = $input['plot_size'];
    $budget_range = $input['budget_range'];
    $requirements = $input['requirements'] ?? '';
    $location = $input['location'] ?? '';
    $timeline = $input['timeline'] ?? '';
    $selected_layout_id = $input['selected_layout_id'] ?? null;
    $layout_type = $input['layout_type'] ?? 'custom';

    // New structured fields
    $plot_shape = $input['plot_shape'] ?? null;
    $topography = $input['topography'] ?? null;
    $development_laws = $input['development_laws'] ?? null;
    $family_needs = $input['family_needs'] ?? null;
    $rooms = $input['rooms'] ?? null;
    $aesthetic = $input['aesthetic'] ?? null;
    
    // Create layout_requests table if it doesn't exist (align with existing DB schema only)
    $create_table_query = "CREATE TABLE IF NOT EXISTS layout_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        homeowner_id INT NOT NULL,
        plot_size VARCHAR(100) NOT NULL,
        budget_range VARCHAR(100) NOT NULL,
        requirements TEXT NULL,
        location VARCHAR(255),
        timeline VARCHAR(100),
        selected_layout_id INT NULL,
        layout_type ENUM('custom', 'library') DEFAULT 'custom',
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        layout_file VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (homeowner_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (selected_layout_id) REFERENCES layout_library(id)
    )";
    $db->exec($create_table_query);
    
    // Pack structured fields into JSON for the existing 'requirements' column
    $requirements_payload = [
        'plot_shape' => $plot_shape,
        'topography' => $topography,
        'development_laws' => $development_laws,
        'family_needs' => $family_needs,
        'rooms' => $rooms,
        'aesthetic' => $aesthetic,
        'notes' => $requirements,
    ];
    $requirements_json = json_encode($requirements_payload);
    
    // Insert layout request into existing columns only
    $query = "INSERT INTO layout_requests (
                user_id, homeowner_id, plot_size, budget_range, requirements, location, timeline, selected_layout_id, layout_type
              ) VALUES (
                :user_id, :homeowner_id, :plot_size, :budget_range, :requirements, :location, :timeline, :selected_layout_id, :layout_type
              )";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $homeowner_id, PDO::PARAM_INT);
    $stmt->bindParam(':homeowner_id', $homeowner_id, PDO::PARAM_INT);
    $stmt->bindParam(':plot_size', $plot_size);
    $stmt->bindParam(':budget_range', $budget_range);
    $stmt->bindParam(':requirements', $requirements_json);
    $stmt->bindParam(':location', $location);
    $stmt->bindParam(':timeline', $timeline);
    $stmt->bindParam(':selected_layout_id', $selected_layout_id);
    $stmt->bindParam(':layout_type', $layout_type);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Layout request submitted successfully',
            'request_id' => $db->lastInsertId()
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to submit layout request'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error submitting request: ' . $e->getMessage()
    ]);
}
?>