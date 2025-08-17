import BaseScraper from './baseScraper.js';

export class VatanScraper extends BaseScraper {
    constructor() {
        super('Vatan');
        this.priceSelectors = [
            '.product-list__price',
            '.product-price__price',
            '.product-price .price',
            'span.product-list__price',
            '.product-detail-price-container .price',
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

export default VatanScraper;