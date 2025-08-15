<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../../config/database.php';
session_start();

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get architect ID from session
    $user = json_decode($_SESSION['user'] ?? '{}', true);
    $architect_id = $user['id'] ?? null;
    
    if (!$architect_id) {
        echo json_encode([
            'success' => false,
            'message' => 'User not logged in'
        ]);
        exit;
    }
    
    // Get architect's layouts
    $query = "SELECT 
                al.id,
                al.layout_request_id,
                al.design_type,
                al.description,
                al.layout_file,
                al.template_id,
                al.notes,
                al.status,
                al.created_at,
                lr.plot_size,
                lr.budget_range,
                lr.requirements,
                u.first_name as homeowner_first_name,
                u.last_name as homeowner_last_name,
                CONCAT(u.first_name, ' ', u.last_name) as homeowner_name
              FROM architect_layouts al
              JOIN layout_requests lr ON al.layout_request_id = lr.id
              JOIN users u ON lr.homeowner_id = u.id
              WHERE al.architect_id = :architect_id
              ORDER BY al.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':architect_id', $architect_id);
    $stmt->execute();
    
    $layouts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'layouts' => $layouts
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching layouts: ' . $e->getMessage()
    ]);
}
?>