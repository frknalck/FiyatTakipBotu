import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import basicAuth from 'express-basic-auth';
import cron from 'node-cron';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import logger from './utils/logger.js';
import { initTelegramBot, sendTestMessage } from './utils/telegram.js';
import checkAllPrices from './jobs/priceChecker.js';
import webRoutes from './routes/web.js';
import apiRoutes from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.engine('ejs', async (filePath, options, callback) => {
    try {
        const html = await ejs.renderFile(filePath, options);
        
        if (options.layout) {
            const layoutPath = path.join(__dirname, 'views', `${options.layout}.ejs`);
            const layoutHtml = await ejs.renderFile(layoutPath, { ...options, body: html });
            callback(null, layoutHtml);
        } else {
            callback(null, html);
        }
    } catch (error) {
        callback(error);
    }
});

const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD || 'admin123';

const authMiddleware = basicAuth({
    users: { [username]: password },
    challenge: true,
    realm: 'Fiyat Takip Botu Admin Panel',
    unauthorizedResponse: 'Yetkisiz erişim!'
});

app.use('/', authMiddleware, webRoutes);
app.use('/api', authMiddleware, apiRoutes);

app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

const telegramBot = initTelegramBot();

const cronSchedule = process.env.CRON_SCHEDULE || '*/5 * * * *';
logger.info(`Setting up cron job with schedule: ${cronSchedule}`);

const job = cron.schedule(cronSchedule, async () => {
    logger.info('Running scheduled price check...');
    await checkAllPrices();
}, {
    scheduled: true,
    timezone: 'Europe/Istanbul'
});

async function gracefulShutdown() {
    logger.info('Shutting down gracefully...');
    job.stop();
    process.exit(0);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

app.listen(PORT, async () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
    logger.info(`Admin credentials - Username: ${username}, Password: ${password}`);
    
    if (telegramBot) {
        const testResult = await sendTestMessage();
        if (testResult.success) {
            logger.info('Telegram bot connection successful');
        } else {
            logger.warn(`Telegram bot connection failed: ${testResult.error}`);
        }
    }
    
    if (process.env.RUN_ON_STARTUP === 'true') {
        logger.info('Running initial price check...');
        setTimeout(() => checkAllPrices(), 10000);
    }
});

export default app;