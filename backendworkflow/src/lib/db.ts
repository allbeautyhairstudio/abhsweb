import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { CREATE_TABLES_SQL } from './schema';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'dashboard.db');
const BACKUP_DIR = path.join(process.cwd(), 'src', 'data', 'backups');
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

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const backupPath = path.join(BACKUP_DIR, `dashboard-${today}.db`);

  // Only create one backup per day
  if (fs.existsSync(backupPath)) return;

  fs.copyFileSync(DB_PATH, backupPath);

  // Remove old backups beyond the rolling window
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
    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    // Initialize tables
    db.exec(CREATE_TABLES_SQL);

    // Auto-backup on first connection each app start
    backupDatabase();
  }
  return db;
}
