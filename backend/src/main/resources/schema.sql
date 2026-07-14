CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;
-- TimescaleDB not supported on AWS RDS. Using standard tables/partitioning.

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL, -- CUSTOMER, STORE_ADMIN, DELIVERY_PARTNER, SYSTEM_ADMIN
    trust_score INT DEFAULT 50,
    is_active BOOLEAN DEFAULT TRUE,
    fcm_token VARCHAR(255)
);

-- Stores Table
CREATE TABLE IF NOT EXISTS stores (
    id SERIAL PRIMARY KEY,
    owner_id INT REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    location GEOGRAPHY(POINT, 4326),
    whatsapp_number VARCHAR(20),
    verification_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    freshness_score DECIMAL(3,1) DEFAULT 5.0,
    is_open BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS stores_location_idx ON stores USING GIST (location);
CREATE INDEX IF NOT EXISTS stores_verification_status_idx ON stores (verification_status);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit_price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    embedding VECTOR(384),
    typical_shelf_life_hours INT
);

-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    store_id INT REFERENCES stores(id),
    product_id INT REFERENCES products(id),
    quantity INT NOT NULL,
    batch_code VARCHAR(100),
    expiry_time TIMESTAMP,
    UNIQUE (store_id, product_id, batch_code)
);

CREATE INDEX IF NOT EXISTS inventory_expiry_time_idx ON inventory (expiry_time);

-- Swarms Table
CREATE TABLE IF NOT EXISTS swarms (
    id SERIAL PRIMARY KEY,
    delivery_partner_id INT REFERENCES users(id),
    order_ids INTEGER[],
    route_polyline TEXT,
    estimated_completion TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES users(id),
    store_id INT REFERENCES stores(id),
    delivery_partner_id INT REFERENCES users(id),
    swarm_id INT REFERENCES swarms(id),
    status VARCHAR(50) NOT NULL, -- PENDING, CONFIRMED, PREPARING, READY, PICKED_UP, DELIVERED, CANCELLED, REFUNDED
    delivery_address TEXT,
    customer_lat DOUBLE PRECISION,
    customer_lng DOUBLE PRECISION,
    total_amount DECIMAL(10,2),
    estimated_delivery_time INT -- in minutes
);

CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON orders (customer_id);
CREATE INDEX IF NOT EXISTS orders_store_id_idx ON orders (store_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id),
    product_id INT REFERENCES products(id),
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL
);

-- Credit Transactions Table
CREATE TABLE IF NOT EXISTS credit_transactions (
    id SERIAL PRIMARY KEY,
    lender_id INT REFERENCES users(id),
    borrower_id INT REFERENCES users(id),
    order_id INT REFERENCES orders(id),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PAID, OVERDUE
    due_date TIMESTAMP
);

CREATE INDEX IF NOT EXISTS credit_transactions_borrower_id_idx ON credit_transactions (borrower_id);
CREATE INDEX IF NOT EXISTS credit_transactions_status_idx ON credit_transactions (status);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id INT REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    target_user_id INT,
    target_store_id INT,
    metadata JSONB,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily Demand Table (Hypertable)
CREATE TABLE IF NOT EXISTS daily_demand (
    store_id INT REFERENCES stores(id),
    product_id INT REFERENCES products(id),
    date DATE NOT NULL,
    quantity_sold INT DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0.0
);

-- Convert daily_demand to a TimescaleDB hypertable
-- Hypertable removed for AWS RDS compatibility. An index on 'date' can be used instead.
CREATE INDEX IF NOT EXISTS daily_demand_date_idx ON daily_demand (date);

-- Media upload pipeline column additions
ALTER TABLE users  ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE users  ADD COLUMN IF NOT EXISTS vehicle_doc_url   TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS logo_url          TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS banner_url        TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS proof_of_delivery_url TEXT;

-- Missing indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id         ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_id            ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_partner_id ON orders(delivery_partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_status              ON orders(status);
CREATE INDEX IF NOT EXISTS idx_inventory_store_id         ON inventory(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id       ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_stores_verification_status ON stores(verification_status);
CREATE INDEX IF NOT EXISTS idx_stores_location ON stores USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_products_embedding ON products USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Unindexed foreign key indexes
CREATE INDEX IF NOT EXISTS idx_swarms_delivery_partner_id ON swarms(delivery_partner_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_lender_id ON credit_transactions(lender_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_borrower_id ON credit_transactions(borrower_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_order_id ON credit_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);

