import BaseScraper from './baseScraper.js';

export class AmazonScraper extends BaseScraper {
    constructor() {
        super('Amazon');
        this.priceSelectors = [
            '.a-price-whole',
            'span.a-price-range',
            '.a-price.a-text-price.a-size-medium.apexPriceToPay',
            '.a-price-now',
            'span.a-price.a-text-price.header-price',
            '.priceBlockBuyingPriceString',
            '#priceblock_dealprice',
            '#priceblock_ourprice',
            '.a-price-whole:first'
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

export default AmazonScraper;