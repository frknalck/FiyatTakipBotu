import BaseScraper from './baseScraper.js';

export class TeknosaScraper extends BaseScraper {
    constructor() {
        super('Teknosa');
        this.priceSelectors = [
            '.pdp-price .prc',
            '.product-detail-price .prc',
            '.price-box .prc',
            '.product-price .prc',
            'span.prc',
            '.pdp-price-new'
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

export default TeknosaScraper;