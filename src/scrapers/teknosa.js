import SimpleAxiosScraper from './simpleAxios.js';

export class TeknosaScraper extends SimpleAxiosScraper {
    constructor() {
        super('Teknosa');
        this.priceSelectors = [
            '.pdp-price .prc',
            '.product-detail-price .prc',
            '.price-box .prc',
            '.product-price .prc',
            'span.prc',
            '.pdp-price-new',
            '.price'
        ];
    }

    async scrapeWithStrategy(url) {
        return await this.scrapePrice(url, this.priceSelectors);
    }
}

export default TeknosaScraper;