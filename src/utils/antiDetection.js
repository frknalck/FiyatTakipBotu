import UserAgent from 'user-agents';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export const getRandomUserAgent = () => {
    const userAgent = new UserAgent({ deviceCategory: 'desktop' });
    return userAgent.toString();
};

export const randomDelay = (min = 1000, max = 3000) => {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
};

export const getBrowserConfig = () => {
    return {
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-blink-features=AutomationControlled',
            '--disable-features=IsolateOrigins,site-per-process',
            `--window-size=${1920 + Math.floor(Math.random() * 100)},${1080 + Math.floor(Math.random() * 100)}`
        ],
        defaultViewport: {
            width: 1920 + Math.floor(Math.random() * 100),
            height: 1080 + Math.floor(Math.random() * 100)
        }
    };
};

export const setupPageEvasion = async (page) => {
    await page.setUserAgent(getRandomUserAgent());
    
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined
        });
        
        Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3, 4, 5]
        });
        
        Object.defineProperty(navigator, 'languages', {
            get: () => ['tr-TR', 'tr', 'en-US', 'en']
        });
        
        window.chrome = {
            runtime: {}
        };
        
        Object.defineProperty(navigator, 'permissions', {
            get: () => ({
                query: () => Promise.resolve({ state: 'granted' })
            })
        });
    });
    
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    });
    
    return page;
};

export const simulateHumanBehavior = async (page) => {
    const x = 100 + Math.floor(Math.random() * 500);
    const y = 100 + Math.floor(Math.random() * 300);
    await page.mouse.move(x, y);
    
    const scrollY = Math.floor(Math.random() * 300) + 100;
    await page.evaluate((y) => {
        window.scrollBy(0, y);
    }, scrollY);
    
    await randomDelay(500, 1500);
};

export default puppeteer;