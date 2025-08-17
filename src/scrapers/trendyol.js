import BaseScraper from './baseScraper.js';

export class TrendyolScraper extends BaseScraper {
    constructor() {
        super('Trendyol');
        this.priceSelectors = [
            '.prc-dsc',
            '.prc-box-dscntd',
            '.product-price-container .prc-dsc',
            '.product-price-new',
            '.price-box .prc-dsc',
            'span.prc-slg'
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

export default TrendyolScraper;