import express from 'express';
import { Product } from '../database/models.js';
import { getScraper } from '../scrapers/index.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.get('/products', async (req, res) => {
    try {
        const products = await Product.getAll();
        res.json({ success: true, data: products });
    } catch (error) {
        logger.error('Error fetching products:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/products', async (req, res) => {
    try {
        const { name, url, threshold } = req.body;
        
        if (!name || !url) {
            return res.status(400).json({ 
                success: false, 
                error: 'Ürün adı ve URL zorunludur' 
            });
        }
        
        const scraper = getScraper(url);
        if (!scraper) {
            return res.status(400).json({ 
                success: false, 
                error: 'Bu site desteklenmiyor' 
            });
        }
        
        const hostname = new URL(url).hostname;
        let site = hostname;
        for (const domain of ['trendyol', 'hepsiburada', 'teknosa', 'amazon', 'vatan', 'pasaj', 'pazarama', 'mediamarkt']) {
            if (hostname.includes(domain)) {
                site = domain.charAt(0).toUpperCase() + domain.slice(1);
                break;
            }
        }
        
        let initialPrice = null;
        try {
            initialPrice = await scraper.scrapePrice(url);
        } catch (error) {
            logger.warn(`Could not fetch initial price for ${url}: ${error.message}`);
        }
        
        const product = await Product.create({
            name,
            url,
            site,
            threshold: threshold || 10,
            lastPrice: initialPrice
        });
        
        res.json({ success: true, data: product });
    } catch (error) {
        logger.error('Error creating product:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.patch('/products/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;
        await Product.toggleActive(parseInt(id));
        res.json({ success: true });
    } catch (error) {
        logger.error('Error toggling product:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Product.delete(parseInt(id));
        res.json({ success: true });
    } catch (error) {
        logger.error('Error deleting product:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const product = await Product.update(parseInt(id), updates);
        res.json({ success: true, data: product });
    } catch (error) {
        logger.error('Error updating product:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;