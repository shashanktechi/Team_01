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
('Bread', 'Whole Wheat Bread', 'Bakery', 40.00, 'http://example.com/bread.jpg', 72),
('Watermelon', 'Fresh Watermelon', 'Fruits', 80.00, 'http://example.com/watermelon.jpg', 120),
('Grapes', 'Green Grapes', 'Fruits', 120.00, 'http://example.com/grapes.jpg', 168),
('Strawberry', 'Fresh Strawberries', 'Fruits', 200.00, 'http://example.com/strawberry.jpg', 96),
('Mango', 'Alphonso Mango', 'Fruits', 300.00, 'http://example.com/mango.jpg', 120),
('Pineapple', 'Fresh Pineapple', 'Fruits', 90.00, 'http://example.com/pineapple.jpg', 168),
('Coconut', 'Tender Coconut', 'Fruits', 50.00, 'http://example.com/coconut.jpg', 48),
('Kiwi', 'Fresh Kiwi', 'Fruits', 150.00, 'http://example.com/kiwi.jpg', 168),
('Lemon', 'Fresh Lemon', 'Fruits', 20.00, 'http://example.com/lemon.jpg', 240),
('Avocado', 'Fresh Avocado', 'Fruits', 250.00, 'http://example.com/avocado.jpg', 96),
('Melon', 'Muskmelon', 'Fruits', 60.00, 'http://example.com/melon.jpg', 120),
('Amul', 'Amul Butter', 'Dairy', 50.00, 'http://example.com/amul.jpg', 360),
('Kwality', 'Kwality Ice Cream', 'Dairy', 100.00, 'http://example.com/kwality.jpg', 720),
('Nescafe', 'Nescafe Coffee', 'Beverages', 150.00, 'http://example.com/nescafe.jpg', 7200),
('Mother Dairy', 'Mother Dairy Milk', 'Dairy', 60.00, 'http://example.com/motherdairy.jpg', 48),
('Act II', 'Act II Popcorn', 'Snacks', 30.00, 'http://example.com/act2.jpg', 3600),
('Haldiram Nuts', 'Haldiram Peanuts', 'Snacks', 20.00, 'http://example.com/haldiram_nuts.jpg', 3600),
('Boba', 'Boba Pearls', 'Beverages', 200.00, 'http://example.com/boba.jpg', 360),
('Dabur', 'Dabur Honey', 'Pantry', 150.00, 'http://example.com/dabur.jpg', 7200)
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
