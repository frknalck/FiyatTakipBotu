import SimpleAxiosScraper from './simpleAxios.js';

export class AmazonScraper extends SimpleAxiosScraper {
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
        return await this.scrapePrice(url, this.priceSelectors);
    }
}

export default AmazonScraper;