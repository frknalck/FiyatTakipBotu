import express from 'express';
import { Product, Notification } from '../database/models.js';
import { getScraper } from '../scrapers/index.js';
import checkAllPrices from '../jobs/priceChecker.js';
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
        
        // İlk fiyat kontrolünü atla, hızlı ekleme için
        let initialPrice = null;
        
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

router.post('/check-prices', async (req, res) => {
    try {
        console.log('🔍 MANUEL FIYAT KONTROLÜ BAŞLATILDI');
        logger.info('Manual price check triggered from web interface');
        
        // Aktif ürün sayısını kontrol et
        const products = await Product.getAll();
        const activeProducts = products.filter(p => p.isActive);
        
        console.log(`📦 ${activeProducts.length} aktif ürün bulundu`);
        logger.info(`Found ${activeProducts.length} active products before check`);
        
        if (activeProducts.length === 0) {
            console.log('❌ Kontrol edilecek aktif ürün yok');
            return res.json({ 
                success: false, 
                message: 'Kontrol edilecek aktif ürün bulunamadı. Önce ürün ekleyin.' 
            });
        }
        
        // Async olarak başlat ve hemen yanıt ver
        console.log('🚀 Fiyat kontrolü başlatılıyor...');
        setImmediate(() => {
            checkAllPrices().catch(error => {
                console.error('💥 Fiyat kontrolü hatası:', error);
                logger.error('Price check failed:', error);
            });
        });
        
        res.json({ 
            success: true, 
            message: `${activeProducts.length} ürün için fiyat kontrolü başlatıldı. Console log'ları kontrol edin.` 
        });
    } catch (error) {
        console.error('💥 Fiyat kontrolü API hatası:', error);
        logger.error('Error starting manual price check:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/test', (req, res) => {
    logger.info('Test endpoint called');
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        message: 'API çalışıyor'
    });
});

router.get('/debug', async (req, res) => {
    try {
        const products = await Product.getAll();
        const notifications = await Notification.getAll(5);
        
        res.json({
            totalProducts: products.length,
            activeProducts: products.filter(p => p.isActive).length,
            recentNotifications: notifications.length,
            products: products.map(p => ({
                id: p.id,
                name: p.name,
                site: p.site,
                isActive: p.isActive,
                lastChecked: p.lastChecked,
                currentPrice: p.currentPrice
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;