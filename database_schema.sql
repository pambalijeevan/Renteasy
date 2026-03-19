-- RentalHub MySQL Database Schema
-- This file contains the complete database structure for the RentalHub platform

-- Create the database
CREATE DATABASE IF NOT EXISTS rentalhub;
USE rentalhub;

-- Drop existing tables (be careful in production!)
DROP TABLE IF EXISTS nearby_places;
DROP TABLE IF EXISTS property_3d_views;
DROP TABLE IF EXISTS property_amenities;
DROP TABLE IF EXISTS property_images;
DROP TABLE IF EXISTS contact_requests;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS users;

-- Users table (both owners and tenants)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('owner', 'tenant') NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Properties table
CREATE TABLE properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    price INT NOT NULL,
    bedrooms INT NOT NULL,
    bathrooms INT NOT NULL,
    area INT NOT NULL,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    available_from DATE NOT NULL,
    owner_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_city (city),
    INDEX idx_type (type),
    INDEX idx_price (price),
    INDEX idx_owner (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Property images table
CREATE TABLE property_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_property (property_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Property amenities table
CREATE TABLE property_amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    amenity VARCHAR(100) NOT NULL,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_property (property_id),
    INDEX idx_amenity (amenity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Nearby places table
CREATE TABLE nearby_places (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    distance VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_property (property_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Property 3D views table
CREATE TABLE property_3d_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    view_3d_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_property (property_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact requests table (optional, for tracking tenant-owner communications)
CREATE TABLE contact_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    tenant_id INT NOT NULL,
    message TEXT,
    status ENUM('pending', 'contacted', 'closed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_property (property_id),
    INDEX idx_tenant (tenant_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing

-- Sample users (passwords are 'password123' hashed with bcrypt)
INSERT INTO users (email, password, name, role, phone) VALUES
('owner1@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWPyS4mC', 'Rajesh Kumar', 'owner', '+91 98765-43210'),
('owner2@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWPyS4mC', 'Priya Sharma', 'owner', '+91 98765-43211'),
('tenant1@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWPyS4mC', 'Amit Patel', 'tenant', '+91 98765-43220'),
('tenant2@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWPyS4mC', 'Sneha Gupta', 'tenant', '+91 98765-43221');

-- Sample properties
INSERT INTO properties (title, description, type, price, bedrooms, bathrooms, area, location, city, available_from, owner_id) VALUES
(
    'Modern Apartment in Hitech City',
    'Beautiful modern apartment in the heart of Hitech City with stunning views. Close to major IT companies and tech parks.',
    'Apartment',
    28000,
    2,
    2,
    1250,
    'Hitech City Road, Madhapur',
    'Hyderabad',
    '2026-03-01',
    1
),
(
    'Luxury Villa in Jubilee Hills',
    'Spacious luxury villa in premium Jubilee Hills area with beautiful garden and modern architecture. Perfect for families.',
    'House',
    75000,
    4,
    3,
    3500,
    'Road No. 45, Jubilee Hills',
    'Hyderabad',
    '2026-03-15',
    2
),
(
    'Cozy Studio in Gachibowli',
    'Charming studio apartment near DLF Cyber City with modern amenities. Ideal for IT professionals.',
    'Studio',
    18000,
    1,
    1,
    650,
    'Gachibowli Main Road',
    'Hyderabad',
    '2026-03-10',
    1
),
(
    '3BHK Flat in Kondapur',
    'Spacious 3BHK apartment in prime Kondapur location. Well-connected to IT hubs and shopping centers.',
    'Apartment',
    32000,
    3,
    2,
    1600,
    'Aparna Cyber Life, Kondapur',
    'Hyderabad',
    '2026-03-20',
    2
),
(
    'Premium Flat in Banjara Hills',
    'Luxurious apartment in the heart of Banjara Hills with excellent connectivity and premium amenities.',
    'Apartment',
    45000,
    3,
    3,
    2000,
    'Road No. 12, Banjara Hills',
    'Hyderabad',
    '2026-03-05',
    1
);

-- Sample property images
INSERT INTO property_images (property_id, image_url, is_main, display_order) VALUES
(1, 'https://images.unsplash.com/photo-1663756915301-2ba688e078cf?w=800', TRUE, 0),
(1, 'https://images.unsplash.com/photo-1502672260066-6bc358858087?w=800', FALSE, 1),
(2, 'https://images.unsplash.com/photo-1706808849780-7a04fbac83ef?w=800', TRUE, 0),
(2, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', FALSE, 1),
(3, 'https://images.unsplash.com/photo-1736773807561-92eb7e6de922?w=800', TRUE, 0);

-- Sample amenities
INSERT INTO property_amenities (property_id, amenity) VALUES
(1, 'WiFi'),
(1, 'Gym'),
(1, 'Parking'),
(1, 'Pool'),
(1, 'Security'),
(2, 'WiFi'),
(2, 'Garden'),
(2, 'Parking'),
(2, 'Security'),
(2, 'Fireplace'),
(3, 'WiFi'),
(3, 'Gym'),
(3, 'Security'),
(3, 'Laundry');

-- Sample nearby places
INSERT INTO nearby_places (property_id, name, distance) VALUES
(1, 'Hitech City Metro Station', '500m'),
(1, 'Inorbit Mall', '1.2km'),
(1, 'Mindspace IT Park', '800m'),
(1, 'Apollo Hospital', '2km'),
(2, 'KBR National Park', '1km'),
(2, 'Jubilee Hills Check Post', '500m'),
(2, 'Jubilee Hills International Centre', '800m'),
(2, 'Yashoda Hospital', '1.5km'),
(3, 'DLF Cyber City', '600m'),
(3, 'Wipro Circle', '1km'),
(3, 'Botanical Garden', '2km'),
(3, 'More Supermarket', '300m'),
(4, 'Botanical Garden Metro', '1.5km'),
(4, 'Ratnadeep Supermarket', '400m'),
(4, 'Oakridge International School', '1km'),
(4, 'KIMS Hospital', '2.5km'),
(5, 'GVK One Mall', '1km'),
(5, 'Metro Station', '800m'),
(5, 'Care Hospital', '1.2km'),
(5, 'Jubilee Hills Circle', '2km');

-- Create indexes for better query performance
CREATE INDEX idx_properties_search ON properties(city, type, price);
CREATE INDEX idx_properties_available ON properties(available_from);
CREATE FULLTEXT INDEX idx_properties_text_search ON properties(title, description, location);

-- Create a view for easy property listing with all details
CREATE VIEW property_full_details AS
SELECT 
    p.*,
    u.name as owner_name,
    u.email as owner_email,
    u.phone as owner_phone,
    GROUP_CONCAT(DISTINCT pi.image_url ORDER BY pi.display_order SEPARATOR ',') as image_urls,
    GROUP_CONCAT(DISTINCT pa.amenity SEPARATOR ',') as amenities_list
FROM properties p
JOIN users u ON p.owner_id = u.id
LEFT JOIN property_images pi ON p.id = pi.property_id
LEFT JOIN property_amenities pa ON p.id = pa.property_id
GROUP BY p.id;

-- Stored procedure to get property with all related data
DELIMITER //
CREATE PROCEDURE GetPropertyDetails(IN prop_id INT)
BEGIN
    -- Get main property data
    SELECT 
        p.*,
        u.name as owner_name,
        u.email as owner_email,
        u.phone as owner_phone
    FROM properties p
    JOIN users u ON p.owner_id = u.id
    WHERE p.id = prop_id;
    
    -- Get images
    SELECT image_url, is_main, display_order
    FROM property_images
    WHERE property_id = prop_id
    ORDER BY display_order;
    
    -- Get amenities
    SELECT amenity
    FROM property_amenities
    WHERE property_id = prop_id;
    
    -- Get nearby places
    SELECT name, distance
    FROM nearby_places
    WHERE property_id = prop_id;
    
    -- Get 3D view
    SELECT view_3d_url
    FROM property_3d_views
    WHERE property_id = prop_id;
END //
DELIMITER ;

-- Show table structure
SHOW TABLES;