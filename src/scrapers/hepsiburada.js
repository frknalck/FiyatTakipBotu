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
        for (const selector of this.priceSelectors) {
            try {
                const price = await this.scrapeWithPuppeteer(url, selector);
                if (price !== null && price > 0) {
                    return price;
                }
            } catch (error) {
                continue;
            }
        }
        
        throw new Error('Could not find price with any selector');
    }
}

export default HepsiburadaScraper;