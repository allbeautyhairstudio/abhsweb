import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { CREATE_TABLES_SQL } from './schema';

/**
 * Database connection — shared between website and CRM admin.
 * Path configurable via CRM_DB_PATH env var.
 * Falls back to the backendworkflow data directory.
 */
const DB_PATH =
  process.env.CRM_DB_PATH
    ? path.resolve(process.cwd(), process.env.CRM_DB_PATH)
    : path.join(process.cwd(), 'src', 'data', 'dashboard.db');

const BACKUP_DIR = path.join(path.dirname(DB_PATH), 'backups');
const MAX_BACKUPS = 7;

let db: Database.Database | null = null;

/**
 * Creates a timestamped backup of the database file.
 * Maintains a rolling window of MAX_BACKUPS (7 days).
 */
function backupDatabase(): void {
  if (!fs.existsSync(DB_PATH)) return;

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const today = new Date().toISOString().slice(0, 10);
  const backupPath = path.join(BACKUP_DIR, `dashboard-${today}.db`);

  if (fs.existsSync(backupPath)) return;

  fs.copyFileSync(DB_PATH, backupPath);

  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('dashboard-') && f.endsWith('.db'))
    .sort()
    .reverse();

  for (const old of backups.slice(MAX_BACKUPS)) {
    fs.unlinkSync(path.join(BACKUP_DIR, old));
  }
}

export function getDb(): Database.Database {
  if (!db) {
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.exec(CREATE_TABLES_SQL);

    // Migration: add business_type column if missing (existing databases)
    const cols = db.prepare("PRAGMA table_info(clients)").all() as Array<{ name: string }>;
    const hasBusinessType = cols.some(c => c.name === 'business_type');
    if (!hasBusinessType) {
      db.exec("ALTER TABLE clients ADD COLUMN business_type TEXT NOT NULL DEFAULT 'salon'");
      db.exec("CREATE INDEX IF NOT EXISTS idx_clients_business_type ON clients(business_type)");
    }

    // Migration: create color tables if missing (existing databases)
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as Array<{ name: string }>;
    const tableNames = new Set(tables.map(t => t.name));
    if (!tableNames.has('color_lines')) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS color_lines (
          id INTEGER PRIMARY KEY AUTOINCREMENT, brand_name TEXT NOT NULL, line_name TEXT NOT NULL,
          is_custom INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')),
          UNIQUE(brand_name, line_name)
        );
        CREATE TABLE IF NOT EXISTS color_shades (
          id INTEGER PRIMARY KEY AUTOINCREMENT, color_line_id INTEGER NOT NULL REFERENCES color_lines(id) ON DELETE CASCADE,
          shade_name TEXT NOT NULL, shade_code TEXT, is_custom INTEGER NOT NULL DEFAULT 0,
          UNIQUE(color_line_id, shade_name)
        );
        CREATE TABLE IF NOT EXISTS color_formulas (
          id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
          created_at TEXT NOT NULL DEFAULT (datetime('now')), service_date TEXT NOT NULL,
          color_line_id INTEGER REFERENCES color_lines(id) ON DELETE SET NULL,
          shade_id INTEGER REFERENCES color_shades(id) ON DELETE SET NULL,
          custom_shade TEXT, developer_volume TEXT, ratio TEXT, processing_time INTEGER,
          technique TEXT, placement TEXT, notes TEXT
        );
        CREATE TABLE IF NOT EXISTS color_inventory (
          id INTEGER PRIMARY KEY AUTOINCREMENT, color_line_id INTEGER NOT NULL REFERENCES color_lines(id) ON DELETE CASCADE,
          shade_id INTEGER REFERENCES color_shades(id) ON DELETE SET NULL,
          quantity REAL NOT NULL DEFAULT 0, minimum_stock REAL NOT NULL DEFAULT 1,
          unit TEXT NOT NULL DEFAULT 'tubes', last_restocked TEXT,
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_color_lines_brand ON color_lines(brand_name);
        CREATE INDEX IF NOT EXISTS idx_color_shades_line ON color_shades(color_line_id);
        CREATE INDEX IF NOT EXISTS idx_color_formulas_client ON color_formulas(client_id);
        CREATE INDEX IF NOT EXISTS idx_color_formulas_date ON color_formulas(service_date);
        CREATE INDEX IF NOT EXISTS idx_color_inventory_line ON color_inventory(color_line_id);
      `);
    }

    // Migration: add client_id to booking_requests if missing (Phase F)
    const brCols = db.prepare("PRAGMA table_info(booking_requests)").all() as Array<{ name: string }>;
    if (!brCols.some(c => c.name === 'client_id')) {
      db.exec("ALTER TABLE booking_requests ADD COLUMN client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL");
      db.exec("CREATE INDEX IF NOT EXISTS idx_booking_requests_client ON booking_requests(client_id)");
    }

    // Migration: add contact/personal columns to clients if missing
    const colNames = new Set(cols.map(c => c.name));
    if (!colNames.has('phone')) {
      db.exec("ALTER TABLE clients ADD COLUMN phone TEXT");
    }
    if (!colNames.has('birthdate')) {
      db.exec("ALTER TABLE clients ADD COLUMN birthdate TEXT");
    }
    if (!colNames.has('preferred_contact')) {
      db.exec("ALTER TABLE clients ADD COLUMN preferred_contact TEXT");
    }
    if (!colNames.has('services_received')) {
      db.exec("ALTER TABLE clients ADD COLUMN services_received TEXT");
    }
    if (!colNames.has('consent_terms_accepted')) {
      db.exec("ALTER TABLE clients ADD COLUMN consent_terms_accepted INTEGER DEFAULT 0");
    }
    if (!colNames.has('consent_date')) {
      db.exec("ALTER TABLE clients ADD COLUMN consent_date TEXT");
    }

    backupDatabase();
  }
  return db;
}
