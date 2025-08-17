import SimpleAxiosScraper from './simpleAxios.js';

export class HepsiburadaScraper extends SimpleAxiosScraper {
    constructor() {
        super('Hepsiburada');
        this.priceSelectors = [
            'span[data-test-id="price-current-price"]',
            '.product-price-wrapper span[data-test-id="price-current-price"]',
            '.price-value',
            '.product-price',
            '.selling-price-tag',
            'span[itemprop="price"]',
            '.money-sign',
            '[data-bind*="currentPriceBeforePoint"]',
            '.offering-price',
            '.price'
        ];
    }

    async scrapeWithStrategy(url) {
        return await this.scrapePrice(url, this.priceSelectors);
    }
}

export default HepsiburadaScraper;