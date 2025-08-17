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
        
        // Önce axios ile dene (daha hızlı)
        for (const selector of this.priceSelectors) {
            try {
                console.log(`🎯 Axios ile selector deneniyor: ${selector}`);
                const price = await this.scrapeWithAxios(url, selector);
                console.log(`💰 Axios - ${selector} sonucu: ${price}`);
                if (price !== null && price > 0) {
                    console.log(`✅ Axios ile başarılı fiyat: ${price}`);
                    return price;
                }
            } catch (error) {
                console.log(`❌ Axios ${selector} hatası: ${error.message}`);
                continue;
            }
        }
        
        // Axios çalışmazsa Puppeteer dene
        for (const selector of this.priceSelectors) {
            try {
                console.log(`🎯 Puppeteer ile selector deneniyor: ${selector}`);
                const price = await this.scrapeWithPuppeteer(url, selector);
                console.log(`💰 Puppeteer - ${selector} sonucu: ${price}`);
                if (price !== null && price > 0) {
                    console.log(`✅ Puppeteer ile başarılı fiyat: ${price}`);
                    return price;
                }
            } catch (error) {
                console.log(`❌ Puppeteer ${selector} hatası: ${error.message}`);
                continue;
            }
        }
        
        console.log(`❌ Hiçbir method çalışmadı`);
        throw new Error('Could not find price with any selector');
    }
}

export default HepsiburadaScraper;