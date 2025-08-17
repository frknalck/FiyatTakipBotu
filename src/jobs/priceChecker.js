import { Product, Notification } from '../database/models.js';
import { scrapePrice, closeAllBrowsers } from '../scrapers/index.js';
import { sendNotification } from '../utils/telegram.js';
import { randomDelay } from '../utils/antiDetection.js';
import pLimit from 'p-limit';
import logger from '../utils/logger.js';

const limit = pLimit(2);

export async function checkProductPrice(product) {
    try {
        console.log(`💰 ${product.name} fiyatı kontrol ediliyor...`);
        logger.info(`Checking price for product ${product.id}: ${product.name}`);
        
        console.log(`🔗 URL: ${product.url}`);
        
        await randomDelay(2000, 5000);
        
        console.log(`🕷️ Scraping başlıyor...`);
        const currentPrice = await scrapePrice(product.url);
        
        console.log(`💸 Bulunan fiyat: ${currentPrice}`);
        
        if (currentPrice === null || currentPrice <= 0) {
            console.log(`❌ Geçersiz fiyat: ${currentPrice}`);
            logger.warn(`Invalid price for product ${product.id}: ${currentPrice}`);
            return;
        }
        
        const previousPrice = product.currentPrice || product.lastPrice;
        
        await Product.updatePrice(product.id, currentPrice);
        
        if (previousPrice && previousPrice > currentPrice) {
            const discountPercent = ((previousPrice - currentPrice) / previousPrice) * 100;
            
            if (discountPercent >= product.threshold) {
                logger.info(`Price drop detected for ${product.name}: ${discountPercent.toFixed(1)}%`);
                
                const notificationSent = await sendNotification(
                    product,
                    previousPrice,
                    currentPrice,
                    discountPercent
                );
                
                if (notificationSent) {
                    await Notification.add({
                        productId: product.id,
                        oldPrice: previousPrice,
                        newPrice: currentPrice,
                        discountPercent
                    });
                }
            }
        }
        
        logger.info(`Price check completed for ${product.name}: ${currentPrice} TL`);
        
    } catch (error) {
        logger.error(`Error checking price for product ${product.id}: ${error.message}`);
    }
}

export async function checkAllPrices() {
    console.log('🔄 ===== FIYAT KONTROLÜ BAŞLIYOR =====');
    logger.info('Starting price check job...');
    const startTime = Date.now();
    
    try {
        const products = (await Product.getAll()).filter(p => p.isActive);
        console.log(`📦 ${products.length} aktif ürün kontrol edilecek`);
        logger.info(`Found ${products.length} active products to check`);
        
        if (products.length === 0) {
            console.log('❌ Kontrol edilecek aktif ürün yok');
            logger.info('No active products to check');
            return;
        }
        
        const siteGroups = {};
        products.forEach(product => {
            if (!siteGroups[product.site]) {
                siteGroups[product.site] = [];
            }
            siteGroups[product.site].push(product);
        });
        
        for (const [site, siteProducts] of Object.entries(siteGroups)) {
            console.log(`🌐 ${site} sitesinden ${siteProducts.length} ürün kontrol ediliyor`);
            logger.info(`Checking ${siteProducts.length} products from ${site}`);
            
            const checkPromises = siteProducts.map(product => 
                limit(() => checkProductPrice(product))
            );
            
            await Promise.allSettled(checkPromises);
            
            console.log(`✅ ${site} kontrolü tamamlandı, 3-6 sn bekleniyor...`);
            await randomDelay(3000, 6000);
        }
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`🎉 ===== FIYAT KONTROLÜ TAMAMLANDI (${duration}s) =====`);
        logger.info(`Price check job completed in ${duration} seconds`);
        
    } catch (error) {
        logger.error(`Error in price check job: ${error.message}`);
    } finally {
        await closeAllBrowsers();
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    checkAllPrices()
        .then(() => {
            logger.info('Manual price check completed');
            process.exit(0);
        })
        .catch(error => {
            logger.error('Manual price check failed:', error);
            process.exit(1);
        });
}

export default checkAllPrices;