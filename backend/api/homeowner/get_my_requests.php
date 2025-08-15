<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
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
    
    // Get all layout requests by this homeowner
    $query = "SELECT lr.*, 
                     ll.title as selected_layout_title,
                     ll.layout_type as selected_layout_type,
                     ll.image_url as selected_layout_image,
                     COUNT(d.id) as design_count,
                     COUNT(p.id) as proposal_count
              FROM layout_requests lr 
              LEFT JOIN layout_library ll ON lr.selected_layout_id = ll.id
              LEFT JOIN designs d ON lr.id = d.layout_request_id
              LEFT JOIN proposals p ON lr.id = p.layout_request_id
              WHERE lr.user_id = :homeowner_id
              GROUP BY lr.id
              ORDER BY lr.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':homeowner_id', $homeowner_id);
    $stmt->execute();
    
    $requests = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $requests[] = [
            'id' => $row['id'],
            'plot_size' => $row['plot_size'],
            'budget_range' => $row['budget_range'],
            'requirements' => $row['requirements'],
            'location' => $row['location'],
            'timeline' => $row['timeline'],
            'layout_type' => $row['layout_type'],
            'selected_layout_id' => $row['selected_layout_id'],
            'selected_layout_title' => $row['selected_layout_title'],
            'selected_layout_type' => $row['selected_layout_type'],
            'selected_layout_image' => $row['selected_layout_image'],
            'status' => $row['status'] ?? 'pending',
            'design_count' => $row['design_count'],
            'proposal_count' => $row['proposal_count'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'requests' => $requests
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching requests: ' . $e->getMessage()
    ]);
}
?>