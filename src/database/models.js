import { runQuery, runStatement, getOne } from './db.js';
import logger from '../utils/logger.js';

export const Product = {
    async getAll() {
        logger.debug('Getting all active products');
        const products = await runQuery('SELECT * FROM products WHERE isActive = 1 ORDER BY createdAt DESC');
        logger.debug(`Found ${products.length} active products`);
        return products;
    },

    async getById(id) {
        return await getOne('SELECT * FROM products WHERE id = ?', [id]);
    },

    async getBySite(site) {
        return await runQuery('SELECT * FROM products WHERE site = ? AND isActive = 1', [site]);
    },

    async create(product) {
        logger.debug(`Creating product: ${product.name} from ${product.site}`);
        const result = await runStatement(
            `INSERT INTO products (name, url, site, threshold, lastPrice) 
             VALUES (?, ?, ?, ?, ?)`,
            [product.name, product.url, product.site, product.threshold, product.lastPrice]
        );
        logger.debug(`Product created with ID: ${result.lastID}`);
        return await this.getById(result.lastID);
    },

    async update(id, updates) {
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(id);
        
        await runStatement(
            `UPDATE products SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
            values
        );
        return await this.getById(id);
    },

    async updatePrice(id, price) {
        const product = await this.getById(id);
        if (product) {
            await runStatement(
                `UPDATE products 
                 SET lastPrice = currentPrice, currentPrice = ?, lastChecked = CURRENT_TIMESTAMP 
                 WHERE id = ?`,
                [price, id]
            );
            
            await PriceHistory.add(id, price);
        }
        return await this.getById(id);
    },

    async delete(id) {
        return await runStatement('DELETE FROM products WHERE id = ?', [id]);
    },

    async toggleActive(id) {
        const product = await this.getById(id);
        if (product) {
            return await runStatement(
                'UPDATE products SET isActive = ? WHERE id = ?',
                [product.isActive ? 0 : 1, id]
            );
        }
    }
};

export const PriceHistory = {
    async add(productId, price) {
        return await runStatement(
            'INSERT INTO price_history (productId, price) VALUES (?, ?)',
            [productId, price]
        );
    },

    async getByProduct(productId, limit = 100) {
        return await runQuery(
            'SELECT * FROM price_history WHERE productId = ? ORDER BY checkedAt DESC LIMIT ?',
            [productId, limit]
        );
    },

    async getLatest(productId) {
        return await getOne(
            'SELECT * FROM price_history WHERE productId = ? ORDER BY checkedAt DESC LIMIT 1',
            [productId]
        );
    }
};

export const Notification = {
    async add(notification) {
        return await runStatement(
            `INSERT INTO notifications (productId, oldPrice, newPrice, discountPercent) 
             VALUES (?, ?, ?, ?)`,
            [notification.productId, notification.oldPrice, notification.newPrice, notification.discountPercent]
        );
    },

    async getAll(limit = 50) {
        return await runQuery(
            `SELECT n.*, p.name, p.url 
             FROM notifications n 
             JOIN products p ON n.productId = p.id 
             ORDER BY n.sentAt DESC 
             LIMIT ?`,
            [limit]
        );
    },

    async getByProduct(productId) {
        return await runQuery(
            'SELECT * FROM notifications WHERE productId = ? ORDER BY sentAt DESC',
            [productId]
        );
    }
};