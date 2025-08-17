import puppeteer, { getBrowserConfig, setupPageEvasion, simulateHumanBehavior, randomDelay } from '../utils/antiDetection.js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import logger from '../utils/logger.js';
import UserAgent from 'user-agents';

export class BaseScraper {
    constructor(siteName) {
        this.siteName = siteName;
        this.browser = null;
        this.retryCount = 3;
        this.retryDelay = 5000;
    }

    async initBrowser() {
        if (!this.browser) {
            this.browser = await puppeteer.launch(getBrowserConfig());
        }
        return this.browser;
    }

    async closeBrowser() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    async scrapeWithPuppeteer(url, priceSelector) {
        let page = null;
        try {
            const browser = await this.initBrowser();
            page = await browser.newPage();
            await setupPageEvasion(page);
            
            await page.goto(url, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });
            
            await simulateHumanBehavior(page);
            await randomDelay(1000, 2000);
            
            await page.waitForSelector(priceSelector, { timeout: 10000 });
            
            const priceText = await page.$eval(priceSelector, el => el.textContent.trim());
            const price = this.parsePrice(priceText);
            
            logger.info(`${this.siteName} - Scraped price: ${price} from ${url}`);
            return price;
            
        } catch (error) {
            logger.error(`${this.siteName} - Puppeteer scraping error for ${url}: ${error.message}`);
            throw error;
        } finally {
            if (page) {
                await page.close();
            }
        }
    }

    async scrapeWithAxios(url, priceSelector) {
        try {
            const userAgent = new UserAgent({ deviceCategory: 'desktop' });
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': userAgent.toString(),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                },
                timeout: 15000
            });
            
            const $ = cheerio.load(response.data);
            const priceText = $(priceSelector).first().text().trim();
            const price = this.parsePrice(priceText);
            
            logger.info(`${this.siteName} - Scraped price with axios: ${price} from ${url}`);
            return price;
            
        } catch (error) {
            logger.error(`${this.siteName} - Axios scraping error for ${url}: ${error.message}`);
            throw error;
        }
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

    async scrapePrice(url) {
        let lastError = null;
        
        for (let attempt = 1; attempt <= this.retryCount; attempt++) {
            try {
                await randomDelay(1000, 3000);
                
                const price = await this.scrapeWithStrategy(url);
                if (price !== null && price > 0) {
                    return price;
                }
                
            } catch (error) {
                lastError = error;
                logger.warn(`${this.siteName} - Attempt ${attempt} failed for ${url}: ${error.message}`);
                
                if (attempt < this.retryCount) {
                    await randomDelay(this.retryDelay * attempt, this.retryDelay * attempt + 2000);
                }
            }
        }
        
        logger.error(`${this.siteName} - All attempts failed for ${url}`);
        throw lastError || new Error('Failed to scrape price');
    }

    async scrapeWithStrategy(url) {
        throw new Error('scrapeWithStrategy must be implemented by subclass');
    }
}

export default BaseScraper;