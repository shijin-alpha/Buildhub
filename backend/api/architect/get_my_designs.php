<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get architect ID from session or request
    session_start();
    $architect_id = $_SESSION['user_id'] ?? null;
    
    if (!$architect_id) {
        echo json_encode([
            'success' => false,
            'message' => 'Architect not authenticated'
        ]);
        exit;
    }
    
    // Get all designs by this architect
    $query = "SELECT d.*, lr.plot_size, lr.budget_range, lr.requirements,
                     CONCAT(u.first_name, ' ', u.last_name) as client_name,
                     u.email as client_email
              FROM designs d 
              JOIN layout_requests lr ON d.layout_request_id = lr.id
              JOIN users u ON lr.user_id = u.id 
              WHERE d.architect_id = :architect_id
              ORDER BY d.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':architect_id', $architect_id);
    $stmt->execute();
    
    $designs = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $designs[] = [
            'id' => $row['id'],
            'layout_request_id' => $row['layout_request_id'],
            'design_title' => $row['design_title'],
            'description' => $row['description'],
            'design_files' => $row['design_files'],
            'status' => $row['status'] ?? 'in-progress',
            'client_name' => $row['client_name'],
            'client_email' => $row['client_email'],
            'plot_size' => $row['plot_size'],
            'budget_range' => $row['budget_range'],
            'requirements' => $row['requirements'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'designs' => $designs
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching designs: ' . $e->getMessage()
    ]);
}
?>