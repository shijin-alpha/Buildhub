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
    
    // Get contractor ID from session
    $user = json_decode($_SESSION['user'] ?? '{}', true);
    $contractor_id = $user['id'] ?? null;
    
    if (!$contractor_id) {
        echo json_encode([
            'success' => false,
            'message' => 'User not logged in'
        ]);
        exit;
    }
    
    // Get contractor's proposals
    $query = "SELECT 
                cp.id,
                cp.layout_request_id,
                cp.materials,
                cp.cost_breakdown,
                cp.total_cost,
                cp.timeline,
                cp.notes,
                cp.status,
                cp.created_at,
                lr.plot_size,
                lr.budget_range,
                lr.requirements,
                u.first_name as homeowner_first_name,
                u.last_name as homeowner_last_name,
                CONCAT(u.first_name, ' ', u.last_name) as homeowner_name
              FROM contractor_proposals cp
              JOIN layout_requests lr ON cp.layout_request_id = lr.id
              JOIN users u ON lr.homeowner_id = u.id
              WHERE cp.contractor_id = :contractor_id
              ORDER BY cp.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':contractor_id', $contractor_id);
    $stmt->execute();
    
    $proposals = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'proposals' => $proposals
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching proposals: ' . $e->getMessage()
    ]);
}
?>