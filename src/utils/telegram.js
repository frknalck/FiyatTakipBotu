import TelegramBot from 'node-telegram-bot-api';
import logger from './logger.js';

let bot = null;

export function initTelegramBot() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!token) {
        logger.warn('Telegram bot token not provided, notifications will be disabled');
        return null;
    }
    
    try {
        bot = new TelegramBot(token, { polling: false });
        logger.info('Telegram bot initialized successfully');
        return bot;
    } catch (error) {
        logger.error('Failed to initialize Telegram bot:', error);
        return null;
    }
}

export async function sendNotification(product, oldPrice, newPrice, discountPercent) {
    if (!bot) {
        logger.warn('Telegram bot not initialized, skipping notification');
        return false;
    }
    
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!chatId) {
        logger.warn('Telegram chat ID not provided, skipping notification');
        return false;
    }
    
    const message = `
📉 *İNDİRİM FIRSATI!*

📦 *Ürün:* ${escapeMarkdown(product.name)}
🏪 *Site:* ${product.site}

💰 *Eski Fiyat:* ~${formatPrice(oldPrice)}~ TL
✅ *Yeni Fiyat:* *${formatPrice(newPrice)} TL*
📊 *İndirim:* *%${discountPercent.toFixed(1)}* 🎉

🔗 [Ürüne Git](${product.url})

⏰ _${new Date().toLocaleString('tr-TR')}_
    `.trim();
    
    try {
        await bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            disable_web_page_preview: false
        });
        
        logger.info(`Notification sent for product ${product.id}: ${product.name}`);
        return true;
    } catch (error) {
        logger.error(`Failed to send Telegram notification: ${error.message}`);
        
        try {
            const fallbackMessage = `
İNDİRİM FIRSATI!

Ürün: ${product.name}
Site: ${product.site}
Eski Fiyat: ${formatPrice(oldPrice)} TL
Yeni Fiyat: ${formatPrice(newPrice)} TL
İndirim: %${discountPercent.toFixed(1)}

Ürün Linki: ${product.url}
            `.trim();
            
            await bot.sendMessage(chatId, fallbackMessage);
            return true;
        } catch (fallbackError) {
            logger.error(`Fallback notification also failed: ${fallbackError.message}`);
            return false;
        }
    }
}

export async function sendTestMessage() {
    if (!bot) {
        return { success: false, error: 'Bot not initialized' };
    }
    
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!chatId) {
        return { success: false, error: 'Chat ID not provided' };
    }
    
    try {
        await bot.sendMessage(chatId, '✅ Fiyat Takip Botu başarıyla bağlandı!');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('tr-TR', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
    }).format(price);
}

function escapeMarkdown(text) {
    return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

export default {
    initTelegramBot,
    sendNotification,
    sendTestMessage
};