-- seed.sql

-- Insert Store
-- Location: HSR Layout, Bangalore (roughly 77.63, 12.91)
INSERT INTO stores (owner_id, name, address, location, whatsapp_number, verification_status, freshness_score, is_open)
SELECT id, 'New Mart', 'HSR Layout', ST_SetSRID(ST_MakePoint(77.63, 12.91), 4326), '+919876543211', 'APPROVED', 5.0, true
FROM users WHERE role='STORE_ADMIN' LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert Products
INSERT INTO products (name, description, category, unit_price, image_url, typical_shelf_life_hours) VALUES
('Apple', 'Fresh Red Apples', 'Fruits', 150.00, 'http://example.com/apple.jpg', 168),
('Milk', 'Full Cream Milk', 'Dairy', 60.00, 'http://example.com/milk.jpg', 48),
('Bread', 'Whole Wheat Bread', 'Bakery', 40.00, 'http://example.com/bread.jpg', 72)
ON CONFLICT DO NOTHING;

-- Insert Inventory
INSERT INTO inventory (store_id, product_id, quantity, batch_code, expiry_time)
SELECT s.id, p.id, 100, 'BATCH001', CURRENT_TIMESTAMP + INTERVAL '7 days'
FROM stores s, products p WHERE p.name='Apple' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO inventory (store_id, product_id, quantity, batch_code, expiry_time)
SELECT s.id, p.id, 50, 'BATCH002', CURRENT_TIMESTAMP + INTERVAL '2 days'
FROM stores s, products p WHERE p.name='Milk' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO inventory (store_id, product_id, quantity, batch_code, expiry_time)
SELECT s.id, p.id, 20, 'BATCH003', CURRENT_TIMESTAMP + INTERVAL '3 days'
FROM stores s, products p WHERE p.name='Bread' LIMIT 1
ON CONFLICT DO NOTHING;
