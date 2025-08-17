import axios from 'axios';
import * as cheerio from 'cheerio';
import UserAgent from 'user-agents';
import { randomDelay } from '../utils/antiDetection.js';
import logger from '../utils/logger.js';

// Basit scraper - sadece axios
export class SimpleAxiosScraper {
    constructor(siteName) {
        this.siteName = siteName;
        this.retryCount = 2;
    }

    async scrapePrice(url, selectors) {
        console.log(`🌐 ${this.siteName} - Axios scraping: ${url}`);
        
        for (let attempt = 1; attempt <= this.retryCount; attempt++) {
            try {
                await randomDelay(1000, 3000);
                
                const userAgent = new UserAgent({ deviceCategory: 'desktop' });
                const response = await axios.get(url, {
                    headers: {
                        'User-Agent': userAgent.toString(),
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
                        'Accept-Encoding': 'gzip, deflate',
                        'Cache-Control': 'no-cache',
                        'Connection': 'keep-alive'
                    },
                    timeout: 15000,
                    validateStatus: (status) => status < 500
                });

                if (response.status === 403) {
                    console.log(`❌ ${this.siteName} - 403 Forbidden (attempt ${attempt})`);
                    continue;
                }

                const $ = cheerio.load(response.data);
                
                for (const selector of selectors) {
                    try {
                        const priceText = $(selector).first().text().trim();
                        const price = this.parsePrice(priceText);
                        
                        if (price !== null && price > 0) {
                            console.log(`✅ ${this.siteName} - Found price: ${price} TL with selector: ${selector}`);
                            return price;
                        }
                    } catch (err) {
                        continue;
                    }
                }
                
                console.log(`❌ ${this.siteName} - No price found with any selector`);
                
            } catch (error) {
                console.log(`❌ ${this.siteName} - Attempt ${attempt} failed: ${error.message}`);
                if (attempt < this.retryCount) {
                    await randomDelay(2000, 4000);
                }
            }
        }
        
        throw new Error(`Failed to scrape ${this.siteName} after ${this.retryCount} attempts`);
    }

    parsePrice(priceText) {
        if (!priceText) return null;
        
        const cleaned = priceText
            .replace(/[^\d,.-]/g, '')
            .replace(/\./g, '')
            .replace(',', '.');
        
        const price = parseFloat(cleaned);
        return isNaN(price) ? null : price;
    }
}

export default SimpleAxiosScraper;