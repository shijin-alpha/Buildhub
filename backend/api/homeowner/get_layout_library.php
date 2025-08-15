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
        price_range VARCHAR(100),
        architect_id INT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (architect_id) REFERENCES users(id)
    )";
    $db->exec($create_table_query);
    
    // Insert sample data if table is empty
    $count_query = "SELECT COUNT(*) as count FROM layout_library";
    $count_stmt = $db->prepare($count_query);
    $count_stmt->execute();
    $count_result = $count_stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($count_result['count'] == 0) {
        // Insert sample layouts
        $sample_layouts = [
            [
                'title' => 'Modern 3BHK Villa',
                'layout_type' => 'Villa',
                'bedrooms' => 3,
                'bathrooms' => 3,
                'area' => 2500,
                'description' => 'Spacious modern villa with open floor plan, large windows, and contemporary design elements.',
                'image_url' => '/images/layouts/modern-3bhk-villa.jpg',
                'price_range' => '25-35 Lakhs'
            ],
            [
                'title' => 'Compact 2BHK Apartment',
                'layout_type' => 'Apartment',
                'bedrooms' => 2,
                'bathrooms' => 2,
                'area' => 1200,
                'description' => 'Efficient 2BHK apartment design perfect for small families with optimized space utilization.',
                'image_url' => '/images/layouts/compact-2bhk-apartment.jpg',
                'price_range' => '12-18 Lakhs'
            ],
            [
                'title' => 'Traditional 4BHK House',
                'layout_type' => 'House',
                'bedrooms' => 4,
                'bathrooms' => 4,
                'area' => 3200,
                'description' => 'Traditional style house with courtyard, separate dining area, and classic architectural elements.',
                'image_url' => '/images/layouts/traditional-4bhk-house.jpg',
                'price_range' => '40-55 Lakhs'
            ],
            [
                'title' => 'Studio Apartment',
                'layout_type' => 'Studio',
                'bedrooms' => 1,
                'bathrooms' => 1,
                'area' => 600,
                'description' => 'Minimalist studio apartment with smart storage solutions and multi-functional spaces.',
                'image_url' => '/images/layouts/studio-apartment.jpg',
                'price_range' => '8-12 Lakhs'
            ],
            [
                'title' => 'Luxury 5BHK Mansion',
                'layout_type' => 'Mansion',
                'bedrooms' => 5,
                'bathrooms' => 6,
                'area' => 5000,
                'description' => 'Luxurious mansion with premium finishes, multiple living areas, and grand entrance.',
                'image_url' => '/images/layouts/luxury-5bhk-mansion.jpg',
                'price_range' => '80+ Lakhs'
            ],
            [
                'title' => 'Duplex 3BHK',
                'layout_type' => 'Duplex',
                'bedrooms' => 3,
                'bathrooms' => 3,
                'area' => 2000,
                'description' => 'Two-story duplex with separate living areas on each floor and private terrace.',
                'image_url' => '/images/layouts/duplex-3bhk.jpg',
                'price_range' => '22-30 Lakhs'
            ],
            [
                'title' => 'Eco-Friendly 2BHK',
                'layout_type' => 'Eco House',
                'bedrooms' => 2,
                'bathrooms' => 2,
                'area' => 1500,
                'description' => 'Sustainable design with solar panels, rainwater harvesting, and natural ventilation.',
                'image_url' => '/images/layouts/eco-friendly-2bhk.jpg',
                'price_range' => '18-25 Lakhs'
            ],
            [
                'title' => 'Penthouse Suite',
                'layout_type' => 'Penthouse',
                'bedrooms' => 4,
                'bathrooms' => 4,
                'area' => 3500,
                'description' => 'Luxury penthouse with panoramic views, private elevator, and rooftop garden.',
                'image_url' => '/images/layouts/penthouse-suite.jpg',
                'price_range' => '60-80 Lakhs'
            ]
        ];
        
        $insert_query = "INSERT INTO layout_library (title, layout_type, bedrooms, bathrooms, area, description, image_url, price_range) 
                        VALUES (:title, :layout_type, :bedrooms, :bathrooms, :area, :description, :image_url, :price_range)";
        $insert_stmt = $db->prepare($insert_query);
        
        foreach ($sample_layouts as $layout) {
            $insert_stmt->execute($layout);
        }
    }
    
    // Get all active layouts
    $query = "SELECT * FROM layout_library WHERE status = 'active' ORDER BY created_at DESC";
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
            'price_range' => $row['price_range'],
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