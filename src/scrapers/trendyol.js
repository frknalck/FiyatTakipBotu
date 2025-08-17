import SimpleAxiosScraper from './simpleAxios.js';

export class TrendyolScraper extends SimpleAxiosScraper {
    constructor() {
        super('Trendyol');
        this.priceSelectors = [
            '.prc-dsc',
            '.prc-box-dscntd',
            '.product-price-container .prc-dsc',
            '.product-price-new',
            '.price-box .prc-dsc',
            'span.prc-slg',
            '.price-current',
            '.product-price',
            '.money-sign'
        ];
    }

    async scrapeWithStrategy(url) {
        return await this.scrapePrice(url, this.priceSelectors);
    }
}

export default TrendyolScraper;