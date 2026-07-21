CREATE TABLE IF NOT EXISTS otp_requests (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    verified BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    trust_score INTEGER DEFAULT 50,
    is_active BOOLEAN DEFAULT TRUE,
    fcm_token VARCHAR(255),
    profile_photo_url VARCHAR(255),
    vehicle_doc_url VARCHAR(255),
    verification_status VARCHAR(50) DEFAULT 'PENDING',
    phone_verified BOOLEAN DEFAULT FALSE,
    city VARCHAR(100),
    vehicle_type VARCHAR(50),
    vehicle_name VARCHAR(50),
    vehicle_model VARCHAR(50),
    vehicle_number VARCHAR(50),
    vehicle_photo_url VARCHAR(255),
    address VARCHAR(255)
);

-- Stores Table
CREATE TABLE IF NOT EXISTS stores (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255) DEFAULT 'Hyderabad',
    address VARCHAR(255),
    location geography(Point,4326),
    whatsapp_number VARCHAR(20),
    verification_status VARCHAR(50) DEFAULT 'PENDING',
    freshness_score NUMERIC(3,1) DEFAULT 5.0,
    is_open BOOLEAN DEFAULT TRUE,
    logo_url VARCHAR(255),
    banner_url VARCHAR(255)
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    category VARCHAR(100),
    unit_price NUMERIC(38,2) NOT NULL,
    image_url VARCHAR(255),
    embedding vector(384),
    typical_shelf_life_hours INTEGER,
    sku VARCHAR(50)
);

-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL REFERENCES stores(id),
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    batch_code VARCHAR(100),
    expiry_time TIMESTAMP,
    UNIQUE (store_id, product_id, batch_code)
);

-- Swarms Table
CREATE TABLE IF NOT EXISTS swarms (
    id BIGSERIAL PRIMARY KEY,
    delivery_partner_id BIGINT REFERENCES users(id),
    order_ids integer[],
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
    status VARCHAR(50) NOT NULL,
    delivery_address VARCHAR(255),
    customer_lat DOUBLE PRECISION,
    customer_lng DOUBLE PRECISION,
    total_amount NUMERIC(38,2),
    estimated_delivery_time INTEGER,
    proof_of_delivery_url VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(38,2) NOT NULL
);

-- Daily Demand Table
CREATE TABLE IF NOT EXISTS daily_demand (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL REFERENCES stores(id),
    product_id BIGINT NOT NULL REFERENCES products(id),
    sale_date DATE NOT NULL,
    quantity_sold INTEGER NOT NULL,
    revenue NUMERIC(10,2) NOT NULL
);

-- Credit Transactions Table
CREATE TABLE IF NOT EXISTS credit_transactions (
    id BIGSERIAL PRIMARY KEY,
    lender_id BIGINT NOT NULL REFERENCES users(id),
    borrower_id BIGINT NOT NULL REFERENCES users(id),
    order_id BIGINT REFERENCES orders(id),
    amount NUMERIC(38,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    due_date TIMESTAMP
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_id BIGINT REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    target_user_id BIGINT,
    target_store_id BIGINT,
    metadata TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Safe Alters for retroactively adding columns to prevent schema drift

-- Users
ALTER TABLE users ADD COLUMN IF NOT EXISTS id BIGINT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS trust_score INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_url VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS vehicle_doc_url VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS vehicle_name VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS vehicle_model VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS vehicle_number VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS vehicle_photo_url VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address VARCHAR(255);

-- Stores
ALTER TABLE stores ADD COLUMN IF NOT EXISTS id BIGINT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS owner_id BIGINT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS city VARCHAR(255);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS address VARCHAR(255);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS location geography(Point,4326);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS freshness_score NUMERIC(3,1);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_open BOOLEAN;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS logo_url VARCHAR(255);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS banner_url VARCHAR(255);

-- Products
ALTER TABLE products ADD COLUMN IF NOT EXISTS id BIGINT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS description VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit_price NUMERIC(38,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS embedding vector(384);
ALTER TABLE products ADD COLUMN IF NOT EXISTS typical_shelf_life_hours INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(50);

-- Inventory
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS id BIGINT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS store_id BIGINT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS product_id BIGINT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS quantity INTEGER;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS expiry_time TIMESTAMP;

-- Swarms
ALTER TABLE swarms ADD COLUMN IF NOT EXISTS id BIGINT;
ALTER TABLE swarms ADD COLUMN IF NOT EXISTS delivery_partner_id BIGINT;
ALTER TABLE swarms ADD COLUMN IF NOT EXISTS order_ids integer[];
ALTER TABLE swarms ADD COLUMN IF NOT EXISTS route_polyline TEXT;
ALTER TABLE swarms ADD COLUMN IF NOT EXISTS estimated_completion TIMESTAMP;

-- Orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS id BIGINT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id BIGINT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS store_id BIGINT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_partner_id BIGINT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS swarm_id BIGINT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_lat DOUBLE PRECISION;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_lng DOUBLE PRECISION;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount NUMERIC(38,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_time INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS proof_of_delivery_url VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;

-- Order Items
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS id BIGINT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS order_id BIGINT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_id BIGINT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS quantity INTEGER;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price NUMERIC(38,2);

-- Daily Demand
ALTER TABLE daily_demand ADD COLUMN IF NOT EXISTS id BIGINT;
ALTER TABLE daily_demand ADD COLUMN IF NOT EXISTS store_id BIGINT;
ALTER TABLE daily_demand ADD COLUMN IF NOT EXISTS product_id BIGINT;
ALTER TABLE daily_demand ADD COLUMN IF NOT EXISTS sale_date DATE;
ALTER TABLE daily_demand ADD COLUMN IF NOT EXISTS quantity_sold INTEGER;
ALTER TABLE daily_demand ADD COLUMN IF NOT EXISTS revenue NUMERIC(10,2);

-- Credit Transactions
ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS id BIGINT;
ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS lender_id BIGINT;
ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS borrower_id BIGINT;
ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS order_id BIGINT;
ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS amount NUMERIC(38,2);
ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS status VARCHAR(50);
ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS due_date TIMESTAMP;

-- Audit Logs
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS id BIGINT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS admin_id BIGINT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS action VARCHAR(255);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS target_user_id BIGINT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS target_store_id BIGINT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS metadata TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;