import SimpleAxiosScraper from './simpleAxios.js';

export class VatanScraper extends SimpleAxiosScraper {
    constructor() {
        super('Vatan');
        this.priceSelectors = [
            '.product-list__price',
            '.product-price__price',
            '.product-price .price',
            'span.product-list__price',
            '.product-detail-price-container .price',
            '.pdp-price',
            '.price'
        ];
    }

    async scrapeWithStrategy(url) {
        return await this.scrapePrice(url, this.priceSelectors);
    }
}

export default VatanScraper;