import BaseScraper from './baseScraper.js';

export class HepsiburadaScraper extends BaseScraper {
    constructor() {
        super('Hepsiburada');
        this.priceSelectors = [
            'span[data-test-id="price-current-price"]',
            '.product-price-wrapper span[data-test-id="price-current-price"]',
            '.price-value',
            '.product-price',
            '.selling-price-tag',
            'span[itemprop="price"]'
        ];
    }

    async scrapeWithStrategy(url) {
        console.log(`🏪 Hepsiburada scraper başlıyor: ${url}`);
        
        for (const selector of this.priceSelectors) {
            try {
                console.log(`🎯 Selector deneniyor: ${selector}`);
                const price = await this.scrapeWithPuppeteer(url, selector);
                console.log(`💰 Selector ${selector} sonucu: ${price}`);
                if (price !== null && price > 0) {
                    console.log(`✅ Başarılı fiyat: ${price}`);
                    return price;
                }
            } catch (error) {
                console.log(`❌ Selector ${selector} hatası: ${error.message}`);
                continue;
            }
        }
        
        console.log(`❌ Hiçbir selector çalışmadı`);
        throw new Error('Could not find price with any selector');
    }
}

export default HepsiburadaScraper;