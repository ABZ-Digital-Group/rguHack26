import express from 'express';

import api_router from './api/router.js';

const router = express.Router();

router.use('/api', api_router);

router.get('/', (req, res) => {
    if (req.user) {
        return res.redirect('/dashboard');
    } else {
        return res.redirect('/login');
    }
});

router.get('/login', (req, res) => {
    return res.render('pages/login.ejs');
});

router.get('/register', (req, res) => {
    return res.render('pages/register.ejs');
});

router.get('/logout', (req, res) => {
    return res.render('pages/logout.ejs');
});

router.use(express.static('public'));

export default router;
