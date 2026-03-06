/**
 * Database migration script - creates all tables and indexes.
 * Uses lat/lng columns instead of PostGIS geometry for portability.
 */
import { pool } from '../config/database';

const MIGRATION_SQL = `
-- NAF nomenclature (hierarchical)
CREATE TABLE IF NOT EXISTS naf_sections (
  code CHAR(1) PRIMARY KEY,
  label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS naf_divisions (
  code CHAR(2) PRIMARY KEY,
  label TEXT NOT NULL,
  section_code CHAR(1) REFERENCES naf_sections(code)
);

CREATE TABLE IF NOT EXISTS naf_groups (
  code VARCHAR(5) PRIMARY KEY,
  label TEXT NOT NULL,
  division_code CHAR(2) REFERENCES naf_divisions(code)
);

CREATE TABLE IF NOT EXISTS naf_classes (
  code VARCHAR(5) PRIMARY KEY,
  label TEXT NOT NULL,
  group_code VARCHAR(5) REFERENCES naf_groups(code)
);

CREATE TABLE IF NOT EXISTS naf_subclasses (
  code VARCHAR(6) PRIMARY KEY,
  label TEXT NOT NULL,
  class_code VARCHAR(5) REFERENCES naf_classes(code)
);

-- Establishments
CREATE TABLE IF NOT EXISTS establishments (
  siret VARCHAR(14) PRIMARY KEY,
  siren VARCHAR(9) NOT NULL,
  nic VARCHAR(5),
  denomination TEXT,
  is_headquarter BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_employer BOOLEAN DEFAULT FALSE,
  workforce_bracket VARCHAR(5),
  creation_date DATE,

  -- Address
  street_number VARCHAR(10),
  street_type VARCHAR(10),
  street_name TEXT,
  address_complement TEXT,
  postal_code VARCHAR(5) NOT NULL,
  city_name TEXT NOT NULL,
  commune_code VARCHAR(5),

  -- Industry
  naf_code VARCHAR(6),

  -- Geolocation (WGS84)
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_establishments_naf ON establishments(naf_code);
CREATE INDEX IF NOT EXISTS idx_establishments_postal ON establishments(postal_code);
CREATE INDEX IF NOT EXISTS idx_establishments_commune ON establishments(commune_code);
CREATE INDEX IF NOT EXISTS idx_establishments_active ON establishments(is_active);
CREATE INDEX IF NOT EXISTS idx_establishments_siren ON establishments(siren);
CREATE INDEX IF NOT EXISTS idx_establishments_lat ON establishments(latitude);
CREATE INDEX IF NOT EXISTS idx_establishments_lng ON establishments(longitude);
CREATE INDEX IF NOT EXISTS idx_establishments_city ON establishments(city_name);
CREATE INDEX IF NOT EXISTS idx_establishments_lat_lng ON establishments(latitude, longitude);
`;

async function migrate() {
  console.log('Running database migration...');

  try {
    await pool.query(MIGRATION_SQL);
    console.log('Migration completed successfully!');

    // Verify tables
    const res = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('Tables created:', res.rows.map(r => r.table_name).join(', '));
  } catch (err) {
    console.error('Migration failed:', err);
    throw err;
  } finally {
    await pool.end();
  }
}

migrate().catch(console.error);
