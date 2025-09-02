<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Create layout_library table if it doesn't exist
    $create_table_query = "CREATE TABLE IF NOT EXISTS layout_library (
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
    )";
    $db->exec($create_table_query);
    // Ensure new column on old tables
    try { $db->exec("ALTER TABLE layout_library ADD COLUMN IF NOT EXISTS design_file_url VARCHAR(500) NULL AFTER image_url"); } catch (Exception $__) {}
    
    // Get all active layouts (with architect info)
    $query = "SELECT ll.*, u.first_name, u.last_name
              FROM layout_library ll
              LEFT JOIN users u ON u.id = ll.architect_id
              WHERE ll.status = 'active'
              ORDER BY ll.created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $layouts = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $layouts[] = [
            'id' => $row['id'],
            'title' => $row['title'],
            'layout_type' => $row['layout_type'],
            'bedrooms' => $row['bedrooms'],
            'bathrooms' => $row['bathrooms'],
            'area' => $row['area'],
            'description' => $row['description'],
            'image_url' => $row['image_url'],
            'design_file_url' => $row['design_file_url'],
            'price_range' => $row['price_range'],
            'architect_id' => $row['architect_id'],
            'architect_name' => trim(($row['first_name'] ?? '').' '.($row['last_name'] ?? '')),
            'created_at' => $row['created_at']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'layouts' => $layouts
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching layout library: ' . $e->getMessage()
    ]);
}
?>