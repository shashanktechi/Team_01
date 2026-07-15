CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

-- TimescaleDB not supported on AWS RDS. Using standard tables/partitioning.

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL, -- CUSTOMER, STORE_ADMIN, DELIVERY_PARTNER, SYSTEM_ADMIN
    trust_score INT DEFAULT 50,
    is_active BOOLEAN DEFAULT TRUE,
    fcm_token VARCHAR(255),
    verification_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    phone_verified BOOLEAN DEFAULT FALSE -- whether the phone number has been verified via OTP
);

-- Stores Table
CREATE TABLE IF NOT EXISTS stores (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    location GEOGRAPHY(POINT, 4326),
    whatsapp_number VARCHAR(20),
    verification_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    freshness_score DECIMAL(3,1) DEFAULT 5.0,
    is_open BOOLEAN DEFAULT TRUE
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
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
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT REFERENCES stores(id),
    product_id BIGINT REFERENCES products(id),
    quantity INT NOT NULL,
    batch_code VARCHAR(100),
    expiry_time TIMESTAMP,
    UNIQUE (store_id, product_id, batch_code)
);

-- Swarms Table
CREATE TABLE IF NOT EXISTS swarms (
    id BIGSERIAL PRIMARY KEY,
    delivery_partner_id BIGINT REFERENCES users(id),
    order_ids INTEGER[],
    route_polyline TEXT,
    estimated_completion TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES users(id),
    store_id BIGINT REFERENCES stores(id),
    delivery_partner_id BIGINT REFERENCES users(id),
    swarm_id BIGINT REFERENCES swarms(id),
    status VARCHAR(50) NOT NULL, -- PENDING, CONFIRMED, PREPARING, READY, PICKED_UP, DELIVERED, CANCELLED, REFUNDED
    delivery_address TEXT,
    customer_lat DOUBLE PRECISION,
    customer_lng DOUBLE PRECISION,
    total_amount DECIMAL(10,2),
    estimated_delivery_time INT -- in minutes
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id),
    product_id BIGINT REFERENCES products(id),
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL
);

-- Credit Transactions Table
CREATE TABLE IF NOT EXISTS credit_transactions (
    id BIGSERIAL PRIMARY KEY,
    lender_id BIGINT REFERENCES users(id),
    borrower_id BIGINT REFERENCES users(id),
    order_id BIGINT REFERENCES orders(id),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PAID, OVERDUE
    due_date TIMESTAMP
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_id BIGINT REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    target_user_id BIGINT,
    target_store_id BIGINT,
    metadata JSONB,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily Demand Table
CREATE TABLE IF NOT EXISTS daily_demand (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT REFERENCES stores(id),
    product_id BIGINT REFERENCES products(id),
    sale_date DATE NOT NULL,
    quantity_sold INT DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0.0
);

-- OPT Requests Table
CREATE TABLE IF NOT EXISTS otp_requests (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    attempt_count INT DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_otp_requests_email ON otp_requests(email);
CREATE INDEX IF NOT EXISTS idx_otp_requests_expires_at ON otp_requests(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_requests_created_at ON otp_requests(created_at);

CREATE INDEX IF NOT EXISTS daily_demand_date_idx ON daily_demand (sale_date);

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
CREATE INDEX IF NOT EXISTS idx_inventory_expiry_time      ON inventory (expiry_time);
CREATE INDEX IF NOT EXISTS idx_stores_verification_status ON stores(verification_status);
CREATE INDEX IF NOT EXISTS idx_stores_location ON stores USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_products_embedding ON products USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Unindexed foreign key indexes
CREATE INDEX IF NOT EXISTS idx_swarms_delivery_partner_id ON swarms(delivery_partner_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_lender_id ON credit_transactions(lender_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_borrower_id ON credit_transactions(borrower_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_order_id ON credit_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);