import SimpleAxiosScraper from './simpleAxios.js';

export class PasajScraper extends SimpleAxiosScraper {
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
        return await this.scrapePrice(url, this.priceSelectors);
    }
}

export default PasajScraper;