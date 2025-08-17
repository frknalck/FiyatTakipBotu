import db from './db.js';

export const Product = {
    getAll() {
        return db.prepare('SELECT * FROM products WHERE isActive = 1 ORDER BY createdAt DESC').all();
    },

    getById(id) {
        return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    },

    getBySite(site) {
        return db.prepare('SELECT * FROM products WHERE site = ? AND isActive = 1').all(site);
    },

    create(product) {
        const stmt = db.prepare(`
            INSERT INTO products (name, url, site, threshold, lastPrice) 
            VALUES (@name, @url, @site, @threshold, @lastPrice)
        `);
        const info = stmt.run(product);
        return this.getById(info.lastInsertRowid);
    },

    update(id, updates) {
        const fields = Object.keys(updates).map(key => `${key} = @${key}`).join(', ');
        const stmt = db.prepare(`UPDATE products SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = @id`);
        stmt.run({ ...updates, id });
        return this.getById(id);
    },

    updatePrice(id, price) {
        const product = this.getById(id);
        if (product) {
            db.prepare(`
                UPDATE products 
                SET lastPrice = currentPrice, currentPrice = ?, lastChecked = CURRENT_TIMESTAMP 
                WHERE id = ?
            `).run(price, id);
            
            PriceHistory.add(id, price);
        }
        return this.getById(id);
    },

    delete(id) {
        return db.prepare('DELETE FROM products WHERE id = ?').run(id);
    },

    toggleActive(id) {
        const product = this.getById(id);
        if (product) {
            return db.prepare('UPDATE products SET isActive = ? WHERE id = ?')
                .run(product.isActive ? 0 : 1, id);
        }
    }
};

export const PriceHistory = {
    add(productId, price) {
        return db.prepare('INSERT INTO price_history (productId, price) VALUES (?, ?)')
            .run(productId, price);
    },

    getByProduct(productId, limit = 100) {
        return db.prepare('SELECT * FROM price_history WHERE productId = ? ORDER BY checkedAt DESC LIMIT ?')
            .all(productId, limit);
    },

    getLatest(productId) {
        return db.prepare('SELECT * FROM price_history WHERE productId = ? ORDER BY checkedAt DESC LIMIT 1')
            .get(productId);
    }
};

export const Notification = {
    add(notification) {
        return db.prepare(`
            INSERT INTO notifications (productId, oldPrice, newPrice, discountPercent) 
            VALUES (@productId, @oldPrice, @newPrice, @discountPercent)
        `).run(notification);
    },

    getAll(limit = 50) {
        return db.prepare(`
            SELECT n.*, p.name, p.url 
            FROM notifications n 
            JOIN products p ON n.productId = p.id 
            ORDER BY n.sentAt DESC 
            LIMIT ?
        `).all(limit);
    },

    getByProduct(productId) {
        return db.prepare('SELECT * FROM notifications WHERE productId = ? ORDER BY sentAt DESC')
            .all(productId);
    }
};