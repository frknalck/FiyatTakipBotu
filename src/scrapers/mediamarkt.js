import BaseScraper from './baseScraper.js';

export class MediaMarktScraper extends BaseScraper {
    constructor() {
        super('MediaMarkt');
        this.priceSelectors = [
            '[data-test="price-now"]',
            '.price-new',
            '.price',
            '.product-price',
            'span[itemprop="price"]',
            '.pdp-price__current'
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

export default MediaMarktScraper;