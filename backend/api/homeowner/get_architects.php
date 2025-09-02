<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Ensure reviews table exists so subqueries won't fail on fresh DBs
    $db->exec("CREATE TABLE IF NOT EXISTS architect_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        architect_id INT NOT NULL,
        homeowner_id INT NOT NULL,
        design_id INT NULL,
        rating TINYINT NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Optional filters
    $search = $_GET['search'] ?? '';
    $specialization = $_GET['specialization'] ?? '';
    $minExp = isset($_GET['min_experience']) ? (int)$_GET['min_experience'] : null;
    $lrid = isset($_GET['layout_request_id']) ? (int)$_GET['layout_request_id'] : 0;

    // Build query with optional join to mark already-assigned architects for a given request
    $select = "SELECT 
                u.id, u.first_name, u.last_name, u.email, u.role, u.is_verified,
                NULL AS phone, NULL AS address, NULL AS company_name,
                NULL AS experience_years, NULL AS specialization,
                NULL AS license, NULL AS portfolio,
                NULL AS created_at,
                (SELECT ROUND(AVG(r.rating),2) FROM architect_reviews r WHERE r.architect_id = u.id) AS avg_rating,
                (SELECT COUNT(*) FROM architect_reviews r2 WHERE r2.architect_id = u.id) AS review_count";
    if ($lrid > 0) {
        $select .= ", (la.id IS NOT NULL) AS already_assigned, la.status AS assignment_status";
    } else {
        $select .= ", 0 AS already_assigned, NULL AS assignment_status";
    }

    $from = " FROM users u";
    if ($lrid > 0) {
        $from .= " LEFT JOIN layout_request_assignments la ON la.architect_id = u.id AND la.layout_request_id = :lrid";
    }

    $where = " WHERE u.role = 'architect' AND u.is_verified = 1";

    $params = [];

    if (!empty($search)) {
        $where .= " AND (u.first_name LIKE :search OR u.last_name LIKE :search OR u.email LIKE :search)";
        $params[':search'] = '%' . $search . '%';
    }

    // Ignore specialization and min_experience filters for compatibility

    $order = " ORDER BY u.id DESC";

    $query = $select . $from . $where . $order;

    $stmt = $db->prepare($query);
    foreach ($params as $k => $v) {
        $stmt->bindValue($k, $v);
    }
    if ($lrid > 0) { $stmt->bindValue(':lrid', $lrid, PDO::PARAM_INT); }
    $stmt->execute();

    $architects = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $architects[] = [
            'id' => (int)$row['id'],
            'first_name' => $row['first_name'],
            'last_name' => $row['last_name'],
            'email' => $row['email'],
            'phone' => $row['phone'],
            'address' => $row['address'],
            'company_name' => $row['company_name'],
            'experience_years' => is_null($row['experience_years']) ? null : (int)$row['experience_years'],
            'specialization' => $row['specialization'],
            'license' => $row['license'],
            'portfolio' => $row['portfolio'],
            'created_at' => $row['created_at'],
            'avg_rating' => is_null($row['avg_rating']) ? null : (float)$row['avg_rating'],
            'review_count' => isset($row['review_count']) ? (int)$row['review_count'] : 0,
            'already_assigned' => isset($row['already_assigned']) ? (bool)$row['already_assigned'] : false,
            'assignment_status' => $row['assignment_status'] ?? null,
        ];
    }

    echo json_encode([
        'success' => true,
        'architects' => $architects
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching architects: ' . $e->getMessage()
    ]);
}