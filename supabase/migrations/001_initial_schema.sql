-- ======================================================================
-- FIFOLEX GAMING CAFE MANAGEMENT PLATFORM
-- PostgreSQL / Supabase Initial Schema Migration
-- Version: 1.0.0
-- ======================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Stations table
CREATE TABLE IF NOT EXISTS stations (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  type VARCHAR(32) NOT NULL,
  zone VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'available',
  hourly_rate_cents INTEGER NOT NULL DEFAULT 600,
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  installed_games TEXT[] NOT NULL DEFAULT '{}',
  position NUMERIC[] NOT NULL DEFAULT '{0, 0, 0}',
  rotation NUMERIC[] NOT NULL DEFAULT '{0, 0, 0}',
  current_session_id VARCHAR(64),
  assigned_staff VARCHAR(128),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(64) PRIMARY KEY,
  station_id VARCHAR(64) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  station_name VARCHAR(64) NOT NULL,
  customer_id VARCHAR(64),
  customer_name VARCHAR(128) NOT NULL,
  customer_phone VARCHAR(64),
  staff_id VARCHAR(64) NOT NULL,
  staff_name VARCHAR(128) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_minutes INTEGER NOT NULL,
  expected_end_time TIMESTAMPTZ NOT NULL,
  actual_end_time TIMESTAMPTZ,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  paused_at TIMESTAMPTZ,
  total_paused_seconds INTEGER NOT NULL DEFAULT 0,
  rate_cents_per_hour INTEGER NOT NULL,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  discount_reason TEXT,
  order_item_ids TEXT[] NOT NULL DEFAULT '{}',
  total_charged_cents INTEGER NOT NULL DEFAULT 0,
  payment_status VARCHAR(32) NOT NULL DEFAULT 'unpaid',
  payment_method VARCHAR(64),
  transfer_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(64) PRIMARY KEY,
  station_id VARCHAR(64) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  station_name VARCHAR(64) NOT NULL,
  station_type VARCHAR(32) NOT NULL,
  customer_id VARCHAR(64),
  customer_name VARCHAR(128) NOT NULL,
  customer_phone VARCHAR(64) NOT NULL,
  customer_email VARCHAR(128),
  date DATE NOT NULL,
  start_time VARCHAR(16) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'confirmed',
  deposit_cents INTEGER NOT NULL DEFAULT 0,
  deposit_paid BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Customers table
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  email VARCHAR(128),
  phone VARCHAR(64) NOT NULL,
  membership_tier VARCHAR(32) NOT NULL DEFAULT 'standard',
  wallet_balance_cents INTEGER NOT NULL DEFAULT 0,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  total_hours_played INTEGER NOT NULL DEFAULT 0,
  preferred_platform VARCHAR(32),
  preferred_station_id VARCHAR(64),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Products & Inventory table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  category VARCHAR(32) NOT NULL,
  price_cents INTEGER NOT NULL,
  cost_cents INTEGER NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Orders table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  order_number VARCHAR(32) NOT NULL UNIQUE,
  session_id VARCHAR(64) REFERENCES sessions(id) ON DELETE SET NULL,
  station_name VARCHAR(64),
  customer_name VARCHAR(128) NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(32) NOT NULL DEFAULT 'new',
  total_cents INTEGER NOT NULL DEFAULT 0,
  paid BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Maintenance Issues table
CREATE TABLE IF NOT EXISTS maintenance_issues (
  id VARCHAR(64) PRIMARY KEY,
  station_id VARCHAR(64) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  station_name VARCHAR(64) NOT NULL,
  severity VARCHAR(32) NOT NULL DEFAULT 'medium',
  description TEXT NOT NULL,
  reported_by VARCHAR(128) NOT NULL,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(32) NOT NULL DEFAULT 'open',
  resolution_notes TEXT
);

-- 8. Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  staff_name VARCHAR(128) NOT NULL,
  role VARCHAR(32) NOT NULL,
  action VARCHAR(64) NOT NULL,
  target_type VARCHAR(64) NOT NULL,
  target_id VARCHAR(64) NOT NULL,
  details TEXT NOT NULL
);

-- Indices for rapid operational lookup
CREATE INDEX IF NOT EXISTS idx_stations_status ON stations(status);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date_station ON bookings(date, station_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Row-Level Security (RLS) Setup
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated staff; customer-specific policies for self-service portal
CREATE POLICY "Staff have full read access" ON stations FOR SELECT USING (true);
CREATE POLICY "Staff have full read access" ON products FOR SELECT USING (true);
