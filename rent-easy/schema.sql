-- ============================================================
-- Rent Easy - MySQL Database Schema
-- Platform: Hyderabad Property Rental
-- ============================================================

CREATE DATABASE IF NOT EXISTS rent_easy;
USE rent_easy;

-- Drop existing tables (cascade order)
DROP TABLE IF EXISTS contact_requests;
DROP TABLE IF EXISTS nearby_places;
DROP TABLE IF EXISTS property_3d_tours;
DROP TABLE IF EXISTS property_amenities;
DROP TABLE IF EXISTS property_images;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS users;

-- ============================================================
-- USERS TABLE (owners and tenants)
-- ============================================================
CREATE TABLE users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    phone         VARCHAR(25)  NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('owner','tenant') NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_email_role (email, role),
    INDEX idx_email (email),
    INDEX idx_role  (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PROPERTIES TABLE
-- ============================================================
CREATE TABLE properties (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    title          VARCHAR(255) NOT NULL,
    description    TEXT,
    type           VARCHAR(100) NOT NULL,
    price          INT          NOT NULL,
    bedrooms       INT          NOT NULL DEFAULT 1,
    bathrooms      INT          NOT NULL DEFAULT 1,
    area           INT          NOT NULL DEFAULT 0,
    location       VARCHAR(255) NOT NULL,
    city           VARCHAR(100) NOT NULL DEFAULT 'Hyderabad',
    furnishing     VARCHAR(100),
    tour_file_name VARCHAR(255),
    owner_id       INT          NOT NULL,
    owner_name     VARCHAR(255),
    owner_phone    VARCHAR(25),
    owner_email    VARCHAR(255),
    available_from DATE         NOT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_city       (city),
    INDEX idx_type       (type),
    INDEX idx_price      (price),
    INDEX idx_owner      (owner_id),
    INDEX idx_owner_email(owner_email),
    FULLTEXT INDEX idx_search (title, description, location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PROPERTY IMAGES TABLE
-- image_type: 'main' | 'nearby' | 'food'
-- ============================================================
CREATE TABLE property_images (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    property_id   INT          NOT NULL,
    image_url     VARCHAR(600) NOT NULL,
    image_type    ENUM('main','nearby','food') NOT NULL DEFAULT 'main',
    display_order INT          NOT NULL DEFAULT 0,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_property  (property_id),
    INDEX idx_img_type  (property_id, image_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PROPERTY AMENITIES TABLE
-- ============================================================
CREATE TABLE property_amenities (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT         NOT NULL,
    amenity     VARCHAR(150) NOT NULL,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_property (property_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- NEARBY PLACES TABLE
-- ============================================================
CREATE TABLE nearby_places (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT         NOT NULL,
    name        VARCHAR(255) NOT NULL,
    distance    VARCHAR(50)  NOT NULL,
    category    VARCHAR(50)  NOT NULL DEFAULT 'other',
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_property (property_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CONTACT REQUESTS TABLE
-- ============================================================
CREATE TABLE contact_requests (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT  NOT NULL,
    tenant_id   INT  NOT NULL,
    message     TEXT,
    status      ENUM('pending','contacted','closed') DEFAULT 'pending',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id)   REFERENCES users(id)       ON DELETE CASCADE,
    INDEX idx_property (property_id),
    INDEX idx_tenant   (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED: 4 MOCK HYDERABAD PROPERTIES
-- ============================================================

-- Mock owner accounts (password = "password123" hashed with bcrypt)
INSERT INTO users (name, email, phone, password_hash, role) VALUES
('Ravi Reddy',       'ravi.reddy@gmail.com',     '+91 98480 12345', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWPyS4mC', 'owner'),
('Lakshmi Narayanan','lakshmi.n@gmail.com',       '+91 99490 56789', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWPyS4mC', 'owner'),
('Suresh Babu',      'suresh.babu@gmail.com',     '+91 97000 34567', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWPyS4mC', 'owner'),
('Anitha Rao',       'anitha.rao@gmail.com',      '+91 91000 78901', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWPyS4mC', 'owner');

-- Mock properties
INSERT INTO properties (title, description, type, price, bedrooms, bathrooms, area, location, city, furnishing, owner_id, owner_name, owner_phone, owner_email, available_from) VALUES
(
  'Luxury 3BHK Apartment in Banjara Hills',
  'Stunning 3BHK luxury apartment in the heart of Banjara Hills. Fully furnished with premium interiors, modular kitchen, and spacious balcony offering breathtaking views of Hyderabad skyline. Just minutes from GVK One Mall, Apollo Hospital, and Hyderabad Metro.',
  'Apartment', 45000, 3, 3, 1800, 'Banjara Hills, Road No. 12', 'Hyderabad', 'Fully Furnished',
  1, 'Ravi Reddy', '+91 98480 12345', 'ravi.reddy@gmail.com', '2026-03-15'
),
(
  'Modern 2BHK Flat in Hitech City',
  'Brand new 2BHK apartment in the IT hub of Hyderabad, Hitech City. Walking distance to Cyber Towers and major tech companies. Semi-furnished with modular kitchen, wardrobe, and AC in all rooms. Easy access to IKEA and Inorbit Mall.',
  'Apartment', 32000, 2, 2, 1200, 'Hitech City, Madhapur', 'Hyderabad', 'Semi-Furnished',
  2, 'Lakshmi Narayanan', '+91 99490 56789', 'lakshmi.n@gmail.com', '2026-03-01'
),
(
  'Premium 4BHK Villa in Jubilee Hills',
  'Magnificent 4BHK independent villa in posh Jubilee Hills with a private garden, car porch, and stunning interiors. Ideal for large families seeking a blend of luxury and privacy. Close to Jubilee Hills Check Post and Film Nagar.',
  'Villa', 85000, 4, 4, 3500, 'Jubilee Hills, Road No. 36', 'Hyderabad', 'Fully Furnished',
  3, 'Suresh Babu', '+91 97000 34567', 'suresh.babu@gmail.com', '2026-04-01'
),
(
  'Affordable 1BHK Studio in Kondapur',
  'Well-maintained 1BHK studio apartment in Kondapur, ideal for working professionals. Unfurnished but has all basic fixtures. Very close to Gachibowli IT corridor. Good connectivity with TSRTC buses and shared autos.',
  'Studio', 16000, 1, 1, 650, 'Kondapur, Near Raheja IT Park', 'Hyderabad', 'Unfurnished',
  4, 'Anitha Rao', '+91 91000 78901', 'anitha.rao@gmail.com', '2026-03-10'
);

-- Property images (main)
INSERT INTO property_images (property_id, image_url, image_type, display_order) VALUES
(1,'https://images.unsplash.com/photo-1711869206287-33a83984d6ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','main',0),
(1,'https://images.unsplash.com/photo-1771327811795-6197403af846?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','main',1),
(1,'https://images.unsplash.com/photo-1762732793012-8bdab3af00b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','main',2),
(2,'https://images.unsplash.com/photo-1737305457496-dc7503cdde1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','main',0),
(2,'https://images.unsplash.com/photo-1711869206287-33a83984d6ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','main',1),
(2,'https://images.unsplash.com/photo-1771327811795-6197403af846?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','main',2),
(3,'https://images.unsplash.com/photo-1647147092965-579d93ed773e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','main',0),
(3,'https://images.unsplash.com/photo-1762732793012-8bdab3af00b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','main',1),
(3,'https://images.unsplash.com/photo-1711869206287-33a83984d6ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','main',2),
(3,'https://images.unsplash.com/photo-1771327811795-6197403af846?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','main',3),
(4,'https://images.unsplash.com/photo-1737305457496-dc7503cdde1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','main',0),
(4,'https://images.unsplash.com/photo-1771327811795-6197403af846?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','main',1),
(4,'https://images.unsplash.com/photo-1762732793012-8bdab3af00b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','main',2);

-- Nearby places images
INSERT INTO property_images (property_id, image_url, image_type, display_order) VALUES
(1,'https://images.unsplash.com/photo-1766486232326-ea3937a1a9c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','nearby',0),
(1,'https://images.unsplash.com/photo-1661695013579-9cdd5d1ef425?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','nearby',1),
(2,'https://images.unsplash.com/photo-1766486232326-ea3937a1a9c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','nearby',0),
(2,'https://images.unsplash.com/photo-1661695013579-9cdd5d1ef425?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','nearby',1),
(3,'https://images.unsplash.com/photo-1661695013579-9cdd5d1ef425?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','nearby',0),
(4,'https://images.unsplash.com/photo-1766486232326-ea3937a1a9c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','nearby',0);

-- Food court images
INSERT INTO property_images (property_id, image_url, image_type, display_order) VALUES
(1,'https://images.unsplash.com/photo-1722573783453-2976e515fe3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','food',0),
(2,'https://images.unsplash.com/photo-1722573783453-2976e515fe3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','food',0),
(3,'https://images.unsplash.com/photo-1722573783453-2976e515fe3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080','food',0);

-- Amenities
INSERT INTO property_amenities (property_id, amenity) VALUES
(1,'High-Speed WiFi'),(1,'Gym & Fitness Center'),(1,'Swimming Pool'),(1,'Covered Parking'),
(1,'24/7 Security'),(1,'CCTV Surveillance'),(1,'Power Backup'),(1,'Lift/Elevator'),
(1,'Modular Kitchen'),(1,'Air Conditioning'),
(2,'High-Speed WiFi'),(2,'Parking'),(2,'24/7 Security'),(2,'CCTV Surveillance'),
(2,'Power Backup'),(2,'Lift/Elevator'),(2,'Air Conditioning'),(2,'Modular Kitchen'),(2,'Gym & Fitness Center'),
(3,'Private Garden'),(3,'Car Porch'),(3,'Swimming Pool'),(3,'High-Speed WiFi'),
(3,'24/7 Security'),(3,'Power Backup'),(3,'Air Conditioning'),(3,'Modular Kitchen'),
(3,'Home Theater'),(3,'Servant Quarters'),(3,'Terrace'),(3,'CCTV Surveillance'),
(4,'High-Speed WiFi'),(4,'Parking'),(4,'24/7 Water Supply'),(4,'Security Guard'),
(4,'Power Backup'),(4,'Lift/Elevator');

-- Nearby places
INSERT INTO nearby_places (property_id, name, distance, category) VALUES
(1,'Banjara Hills Metro Station','0.3 km','metro'),
(1,'GVK One Mall','1.2 km','mall'),
(1,'Apollo Hospital','0.8 km','hospital'),
(1,'KBR National Park','2.5 km','park'),
(1,'Eat Street','1.8 km','restaurant'),
(2,'Hitech City Metro Station','0.5 km','metro'),
(2,'Inorbit Mall','1.0 km','mall'),
(2,'IKEA Hyderabad','3.2 km','mall'),
(2,'Cyber Towers IT Park','0.8 km','other'),
(3,'Jubilee Hills Check Post','0.4 km','other'),
(3,'Ohri''s Restaurant','1.0 km','restaurant'),
(3,'Hyderabad Public School','1.5 km','school'),
(3,'KIMS Hospital','2.2 km','hospital'),
(4,'Kondapur Metro Station','0.7 km','metro'),
(4,'Raheja IT Park','0.3 km','other'),
(4,'Kondapur Market','0.5 km','other');

-- ============================================================
-- VIEW: full property details
-- ============================================================
CREATE OR REPLACE VIEW v_property_list AS
SELECT
    p.id, p.title, p.description, p.type, p.price,
    p.bedrooms, p.bathrooms, p.area, p.location, p.city,
    p.furnishing, p.tour_file_name, p.owner_id,
    p.owner_name, p.owner_phone, p.owner_email,
    p.available_from, p.created_at,
    (SELECT image_url FROM property_images pi
     WHERE pi.property_id = p.id AND pi.image_type = 'main'
     ORDER BY pi.display_order LIMIT 1) AS main_image
FROM properties p;

SHOW TABLES;
