import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Production'da memory database kullan, development'da file
const isProduction = process.env.NODE_ENV === 'production';
const dbPath = isProduction ? ':memory:' : '/app/data/data.db';

let db;

if (!isProduction) {
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
}

try {
    console.log(`📂 Creating ${isProduction ? 'memory' : 'file'} database at: ${dbPath}`);
    db = new sqlite3.Database(dbPath);
    
    // Error handler ekle
    db.on('error', (err) => {
        console.error('❌ Database error:', err);
    });
    
    console.log(`✅ Database connected successfully`);
} catch (error) {
    console.error(`❌ Database connection failed:`, error);
    // Exit etmesin, memory database dene
    console.log(`🔄 Trying memory database as fallback...`);
    db = new sqlite3.Database(':memory:');
}

const initQuery = `
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL UNIQUE,
        site TEXT NOT NULL,
        lastPrice REAL,
        currentPrice REAL,
        threshold REAL DEFAULT 10,
        isActive INTEGER DEFAULT 1,
        lastChecked DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS price_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId INTEGER NOT NULL,
        price REAL NOT NULL,
        checkedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId INTEGER NOT NULL,
        oldPrice REAL NOT NULL,
        newPrice REAL NOT NULL,
        discountPercent REAL NOT NULL,
        sentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_products_site ON products(site);
    CREATE INDEX IF NOT EXISTS idx_products_active ON products(isActive);
    CREATE INDEX IF NOT EXISTS idx_price_history_product ON price_history(productId);
    CREATE INDEX IF NOT EXISTS idx_notifications_product ON notifications(productId);
`;

try {
    console.log(`🔧 Initializing database tables...`);
    db.exec(initQuery);
    console.log(`✅ Database tables created successfully`);
} catch (error) {
    console.error(`❌ Database initialization failed:`, error);
    process.exit(1);
}

export const runQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

export const runStatement = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

export const getOne = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

export default db;