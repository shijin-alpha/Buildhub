<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get filter parameters
    $role = $_GET['role'] ?? 'all';
    $status = $_GET['status'] ?? 'all';
    $search = $_GET['search'] ?? '';
    $sortBy = $_GET['sortBy'] ?? 'created_at';
    $sortOrder = $_GET['sortOrder'] ?? 'desc';
    
    // Validate sort parameters
    $allowedSortFields = ['created_at', 'first_name', 'last_name', 'email', 'role', 'status'];
    if (!in_array($sortBy, $allowedSortFields)) {
        $sortBy = 'created_at';
    }
    
    $sortOrder = strtoupper($sortOrder) === 'ASC' ? 'ASC' : 'DESC';
    
    // Build the query
    $query = "SELECT 
                id, first_name, last_name, email, phone, address, role, status, 
                company_name, experience_years, specialization, license, portfolio,
                created_at, updated_at
              FROM users 
              WHERE 1=1";
    
    $params = [];
    
    // Add role filter
    if ($role !== 'all') {
        $query .= " AND role = :role";
        $params[':role'] = $role;
    }
    
    // Add status filter
    if ($status !== 'all') {
        $query .= " AND status = :status";
        $params[':status'] = $status;
    }
    
    // Add search filter
    if (!empty($search)) {
        $query .= " AND (
            first_name LIKE :search OR 
            last_name LIKE :search OR 
            email LIKE :search OR 
            phone LIKE :search OR
            company_name LIKE :search
        )";
        $params[':search'] = '%' . $search . '%';
    }
    
    // Add sorting
    $query .= " ORDER BY $sortBy $sortOrder";
    
    $stmt = $db->prepare($query);
    
    // Bind parameters
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    $stmt->execute();
    
    $users = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $users[] = [
            'id' => $row['id'],
            'first_name' => $row['first_name'],
            'last_name' => $row['last_name'],
            'email' => $row['email'],
            'phone' => $row['phone'],
            'address' => $row['address'],
            'role' => $row['role'],
            'status' => $row['status'],
            'company_name' => $row['company_name'],
            'experience_years' => $row['experience_years'],
            'specialization' => $row['specialization'],
            'license' => $row['license'],
            'portfolio' => $row['portfolio'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at']
        ];
    }
    
    // Get summary statistics
    $statsQuery = "SELECT 
                    COUNT(*) as total_users,
                    SUM(CASE WHEN role = 'homeowner' THEN 1 ELSE 0 END) as homeowners,
                    SUM(CASE WHEN role = 'contractor' THEN 1 ELSE 0 END) as contractors,
                    SUM(CASE WHEN role = 'architect' THEN 1 ELSE 0 END) as architects,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                    SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended
                   FROM users";
    
    $statsStmt = $db->prepare($statsQuery);
    $statsStmt->execute();
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'users' => $users,
        'stats' => $stats,
        'filters' => [
            'role' => $role,
            'status' => $status,
            'search' => $search,
            'sortBy' => $sortBy,
            'sortOrder' => $sortOrder
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching users: ' . $e->getMessage()
    ]);
}
?>