import express from 'express';
import { Product, Notification } from '../database/models.js';

const router = express.Router();

router.get('/', (req, res) => {
    const products = Product.getAll();
    const notifications = Notification.getAll(10);
    
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

router.get('/products', (req, res) => {
    const products = Product.getAll();
    res.render('products', { 
        layout: 'layout',
        body: '',
        products 
    });
});

router.get('/notifications', (req, res) => {
    const notifications = Notification.getAll(100);
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