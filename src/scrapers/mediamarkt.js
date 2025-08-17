import SimpleAxiosScraper from './simpleAxios.js';

export class MediaMarktScraper extends SimpleAxiosScraper {
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
        return await this.scrapePrice(url, this.priceSelectors);
    }
}

export default MediaMarktScraper;