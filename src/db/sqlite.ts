import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

export const initDB = async () => {
  if (db) return db;
  
  db = await SQLite.openDatabaseAsync('cart.db');

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT,
        price REAL,
        stock INTEGER,
        image_url TEXT,
        updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS cart_operations (
        id TEXT PRIMARY KEY,
        type TEXT, -- 'ADD' | 'REMOVE' | 'UPDATE_QTY' | 'CLEAR'
        product_id TEXT,
        quantity INTEGER,
        price_at_op REAL,
        timestamp INTEGER,
        synced INTEGER DEFAULT 0,
        conflict TEXT -- null | 'SOLD_OUT' | 'PRICE_CHANGE' | 'QTY_EXCEEDED'
    );

    CREATE TABLE IF NOT EXISTS cart_items (
        id TEXT PRIMARY KEY,
        product_id TEXT,
        quantity INTEGER,
        price_at_add REAL
    );

    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        items_json TEXT,
        total REAL,
        status TEXT,
        created_at INTEGER,
        synced_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    );
  `);

  // Initialize default settings
  await db.runAsync('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', ['onboarding_complete', 'false']);

  return db;
};

export const getDB = () => {
  return db;
};
