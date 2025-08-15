<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get layout requests that have approved layouts (ready for contractor proposals)
    $query = "SELECT 
                lr.id,
                lr.homeowner_id,
                lr.plot_size,
                lr.budget_range,
                lr.requirements,
                lr.preferred_style,
                lr.created_at,
                u.first_name as homeowner_first_name,
                u.last_name as homeowner_last_name,
                CONCAT(u.first_name, ' ', u.last_name) as homeowner_name,
                al.layout_file
              FROM layout_requests lr
              JOIN users u ON lr.homeowner_id = u.id
              LEFT JOIN architect_layouts al ON lr.id = al.layout_request_id AND al.status = 'approved'
              WHERE lr.status = 'active'
              AND al.id IS NOT NULL
              ORDER BY lr.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'requests' => $requests
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching layout requests: ' . $e->getMessage()
    ]);
}
?>