import BaseScraper from './baseScraper.js';

export class PazaramaScraper extends BaseScraper {
    constructor() {
        super('Pazarama');
        this.priceSelectors = [
            '.product-price .price',
            '.price-box .price-now',
            '.product-detail-price',
            '.current-price',
            'span.price',
            '.pdp-price'
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
        
        for (const selector of this.priceSelectors) {
            try {
                const price = await this.scrapeWithAxios(url, selector);
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

export default PazaramaScraper;