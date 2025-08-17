import TrendyolScraper from './trendyol.js';
import HepsiburadaScraper from './hepsiburada.js';
import TeknosaScraper from './teknosa.js';
import AmazonScraper from './amazon.js';
import VatanScraper from './vatan.js';
import PasajScraper from './pasaj.js';
import PazaramaScraper from './pazarama.js';
import MediaMarktScraper from './mediamarkt.js';
import logger from '../utils/logger.js';

const scrapers = {
    'trendyol.com': new TrendyolScraper(),
    'hepsiburada.com': new HepsiburadaScraper(),
    'teknosa.com': new TeknosaScraper(),
    'amazon.com.tr': new AmazonScraper(),
    'vatanbilgisayar.com': new VatanScraper(),
    'pasaj.com': new PasajScraper(),
    'pazarama.com': new PazaramaScraper(),
    'mediamarkt.com.tr': new MediaMarktScraper()
};

export function getScraper(url) {
    const hostname = new URL(url).hostname.toLowerCase();
    
    for (const [domain, scraper] of Object.entries(scrapers)) {
        if (hostname.includes(domain)) {
            return scraper;
        }
    }
    
    logger.warn(`No scraper found for URL: ${url}`);
    return null;
}

export async function scrapePrice(url) {
    const scraper = getScraper(url);
    if (!scraper) {
        throw new Error(`No scraper available for URL: ${url}`);
    }
    
    try {
        const price = await scraper.scrapePrice(url);
        return price;
    } catch (error) {
        logger.error(`Failed to scrape price from ${url}: ${error.message}`);
        throw error;
    }
}

export async function closeAllBrowsers() {
    const promises = Object.values(scrapers).map(scraper => scraper.closeBrowser());
    await Promise.all(promises);
}

export default {
    getScraper,
    scrapePrice,
    closeAllBrowsers
};