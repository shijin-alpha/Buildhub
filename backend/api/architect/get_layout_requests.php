<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get all approved layout requests that don't have designs yet or need new designs
    $query = "SELECT lr.*, u.first_name, u.last_name, u.email,
                     CONCAT(u.first_name, ' ', u.last_name) as homeowner_name,
                     COUNT(d.id) as design_count
              FROM layout_requests lr 
              JOIN users u ON lr.user_id = u.id 
              LEFT JOIN designs d ON lr.id = d.layout_request_id
              WHERE lr.status = 'approved'
              GROUP BY lr.id
              ORDER BY lr.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $requests = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $requests[] = [
            'id' => $row['id'],
            'homeowner_name' => $row['homeowner_name'],
            'plot_size' => $row['plot_size'],
            'budget_range' => $row['budget_range'],
            'requirements' => $row['requirements'],
<<<<<<< HEAD
            // decode structured requirements if JSON
            'requirements_parsed' => json_decode($row['requirements'], true),
            'plot_shape' => $row['plot_shape'],
            'topography' => $row['topography'],
            'development_laws' => $row['development_laws'],
            'family_needs' => $row['family_needs'],
            'rooms' => $row['rooms'],
            'aesthetic' => $row['aesthetic'],
=======
>>>>>>> 72588aad4ec69605b25ef4fe70cda4054305a235
            'location' => $row['location'] ?? 'Not specified',
            'layout_file' => $row['layout_file'],
            'created_at' => $row['created_at'],
            'design_count' => $row['design_count']
        ];
    }
    
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