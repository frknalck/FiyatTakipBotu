import SimpleAxiosScraper from './simpleAxios.js';

export class PazaramaScraper extends SimpleAxiosScraper {
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
        return await this.scrapePrice(url, this.priceSelectors);
    }
}

export default PazaramaScraper;