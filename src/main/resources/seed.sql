-- seed.sql

-- Insert Users
INSERT INTO users (phone, email, full_name, role, trust_score, is_active) VALUES 
('+919876543210', 'customer@example.com', 'Ramesh', 'CUSTOMER', 50, true),
('+919876543211', 'storeadmin@example.com', 'Raj', 'STORE_ADMIN', 50, true),
('+919876543212', 'delivery@example.com', 'Suresh', 'DELIVERY_PARTNER', 50, true),
('+919876543213', 'admin@example.com', 'Admin', 'SYSTEM_ADMIN', 100, true);

-- Insert Store
-- Location: HSR Layout, Bangalore (roughly 77.63, 12.91)
INSERT INTO stores (owner_id, name, address, location, whatsapp_number, verification_status, freshness_score, is_open) VALUES
((SELECT id FROM users WHERE role='STORE_ADMIN' LIMIT 1), 'New Mart', 'HSR Layout', ST_SetSRID(ST_MakePoint(77.63, 12.91), 4326), '+919876543211', 'APPROVED', 5.0, true);

-- Insert Products
INSERT INTO products (name, description, category, unit_price, image_url, typical_shelf_life_hours) VALUES
('Apple', 'Fresh Red Apples', 'Fruits', 150.00, 'http://example.com/apple.jpg', 168),
('Milk', 'Full Cream Milk', 'Dairy', 60.00, 'http://example.com/milk.jpg', 48),
('Bread', 'Whole Wheat Bread', 'Bakery', 40.00, 'http://example.com/bread.jpg', 72);

-- Insert Inventory
INSERT INTO inventory (store_id, product_id, quantity, batch_code, expiry_time) VALUES
((SELECT id FROM stores LIMIT 1), (SELECT id FROM products WHERE name='Apple'), 100, 'BATCH001', CURRENT_TIMESTAMP + INTERVAL '7 days'),
((SELECT id FROM stores LIMIT 1), (SELECT id FROM products WHERE name='Milk'), 50, 'BATCH002', CURRENT_TIMESTAMP + INTERVAL '2 days'),
((SELECT id FROM stores LIMIT 1), (SELECT id FROM products WHERE name='Bread'), 20, 'BATCH003', CURRENT_TIMESTAMP + INTERVAL '3 days');

-- Insert Orders
INSERT INTO orders (customer_id, store_id, status, delivery_address, customer_lat, customer_lng, total_amount, estimated_delivery_time) VALUES
((SELECT id FROM users WHERE role='CUSTOMER' LIMIT 1), (SELECT id FROM stores LIMIT 1), 'PENDING', 'Sector 2, HSR', 12.915, 77.635, 210.00, 25);

-- Insert Order Items
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
((SELECT id FROM orders LIMIT 1), (SELECT id FROM products WHERE name='Apple'), 1, 150.00),
((SELECT id FROM orders LIMIT 1), (SELECT id FROM products WHERE name='Milk'), 1, 60.00);
