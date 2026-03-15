-- ══════════════════════════════════════════════
-- ESA website — Schema de base de datos
-- Ejecutar una sola vez al crear la DB en Railway
-- ══════════════════════════════════════════════

-- ADMINS (equipo ESA)
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- CLIENTES
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(30),
  company VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- PROYECTOS
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  project_name VARCHAR(150) NOT NULL,
  domain VARCHAR(150),
  project_type VARCHAR(50) CHECK (project_type IN ('landing_page','business_website','ecommerce','menu_digital','otro')),
  status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning','design','development','review','completed','cancelled')),
  start_date DATE,
  delivery_date DATE,
  price DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- PAGOS
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('paid','pending','overdue')),
  payment_date DATE,
  payment_method VARCHAR(50) CHECK (payment_method IN ('nequi','daviplata','bancolombia','efectivo','transferencia','otro')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- RENOVACIONES ANUALES
CREATE TABLE IF NOT EXISTS renewals (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  renewal_type VARCHAR(50) CHECK (renewal_type IN ('hosting','domain','maintenance','full')),
  renewal_price DECIMAL(12,2),
  renewal_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ÍNDICES para mejorar velocidad de consultas
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_project ON payments(project_id);
CREATE INDEX IF NOT EXISTS idx_renewals_project ON renewals(project_id);
CREATE INDEX IF NOT EXISTS idx_renewals_date ON renewals(renewal_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

-- FUNCIÓN para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_projects_updated
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
