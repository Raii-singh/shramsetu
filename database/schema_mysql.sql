-- ShramSetu Database Schema (MySQL Version)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(15) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash TEXT NOT NULL,
  role ENUM('client', 'worker', 'admin') NOT NULL DEFAULT 'client',
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Workers table
CREATE TABLE IF NOT EXISTS workers (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  skills JSON, -- Store as JSON array ["Skill1", "Skill2"]
  experience INTEGER DEFAULT 0,
  bio TEXT,
  location VARCHAR(255) DEFAULT '',
  pricing JSON, -- Store as JSON object {"Skill1": 300}
  verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE(user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  base_price INTEGER NOT NULL DEFAULT 200,
  description TEXT,
  icon VARCHAR(100) DEFAULT '🔧',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  worker_id CHAR(36) NOT NULL,
  service_id CHAR(36) NOT NULL,
  status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
  scheduled_at DATETIME NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (worker_id) REFERENCES workers(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id CHAR(36) PRIMARY KEY,
  booking_id CHAR(36) NOT NULL,
  amount INTEGER NOT NULL,
  method VARCHAR(30) DEFAULT 'razorpay',
  status ENUM('created', 'paid', 'failed', 'refunded') DEFAULT 'created',
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  worker_id CHAR(36) NOT NULL,
  booking_id CHAR(36),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (worker_id) REFERENCES workers(id),
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Indexes
CREATE INDEX idx_workers_location ON workers(location);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_worker ON bookings(worker_id);
CREATE INDEX idx_reviews_worker ON reviews(worker_id);
