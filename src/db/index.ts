import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

async function addColumnIfNotExists(table: string, column: string, def: string) {
  try {
    await db!.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`);
  } catch {}
}

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('masroofi.db');

  await db.execAsync('PRAGMA journal_mode = WAL');
  await db.execAsync('PRAGMA foreign_keys = ON');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      avatar_uri TEXT,
      language TEXT NOT NULL DEFAULT 'ar',
      theme TEXT NOT NULL DEFAULT 'system',
      reminders_enabled INTEGER NOT NULL DEFAULT 1,
      user_type TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  await addColumnIfNotExists('profiles', 'gender', "TEXT DEFAULT ''");
  await addColumnIfNotExists('profiles', 'location', "TEXT DEFAULT ''");
  await addColumnIfNotExists('profiles', 'age', 'INTEGER DEFAULT 0');
  await addColumnIfNotExists('profiles', 'user_type', "TEXT NOT NULL DEFAULT 'user'");

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item TEXT NOT NULL,
      price REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'جنيه',
      sub_category TEXT NOT NULL,
      main_category TEXT NOT NULL,
      description TEXT NOT NULL,
      confidence REAL NOT NULL DEFAULT 0,
      merchant TEXT,
      transcript_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (transcript_id) REFERENCES recordings(id) ON DELETE SET NULL
    )
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS recordings (
      id TEXT PRIMARY KEY,
      transcript TEXT NOT NULL,
      duration_ms INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      time TEXT NOT NULL,
      meridiem TEXT NOT NULL DEFAULT 'PM',
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    )
  `);

  return db;
}
