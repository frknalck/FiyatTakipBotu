import BaseScraper from './baseScraper.js';

export class PasajScraper extends BaseScraper {
    constructor() {
        super('Pasaj');
        this.priceSelectors = [
            '.price-box .price',
            '.product-price',
            '.current-price',
            '.sale-price',
            'span.price',
            '.product-detail-price'
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

export default PasajScraper;