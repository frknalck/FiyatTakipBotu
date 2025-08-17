import express from 'express';
import { Product, Notification } from '../database/models.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const products = await Product.getAll();
    const notifications = await Notification.getAll(10);
    
    const stats = {
        totalProducts: products.length,
        activeProducts: products.filter(p => p.isActive).length,
        totalNotifications: notifications.length
    };
    
    res.render('index', { 
        layout: 'layout',
        body: '',
        stats,
        recentNotifications: notifications
    });
});

router.get('/products', async (req, res) => {
    const products = await Product.getAll();
    res.render('products', { 
        layout: 'layout',
        body: '',
        products 
    });
});

router.get('/notifications', async (req, res) => {
    const notifications = await Notification.getAll(100);
    res.render('notifications', { 
        layout: 'layout',
        body: '',
        notifications 
    });
});

router.get('/logout', (req, res) => {
    res.redirect('/');
});

export default router;