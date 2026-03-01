import express from 'express';

import api_router from './api/router.js';
import { db } from './database.js';

const router = express.Router();

router.use('/api', api_router);

router.get('/', (req, res) => {
    if (req.user) {
        return res.redirect('/dashboard');
    } else {
        return res.render('pages/splash.ejs');
    }
});

router.get('/login', (req, res) => {
    return res.render('pages/login.ejs');
});

router.get('/register', (req, res) => {
    return res.render('pages/register.ejs');
});

router.get('/dashboard', (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    return res.render('pages/dashboard.ejs', { 
        user: req.user
    });
});

router.get('/logout', (req, res) => {
    return res.render('pages/logout.ejs');
});

router.get('/leaderboard', (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    return res.render('pages/leaderboard.ejs',{
        user: req.user
    }
    );
});

router.get('/route', (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    
    db.collection('journeys').findOne({ userId: req.user._id, status: 'in-progress' }).then(activeJourney => {

        if (activeJourney) {
            return res.render('pages/activeJourney.ejs', {
                user: req.user
            });
        } else {
            return res.render('pages/planRoute.ejs', {
                user: req.user
            });
        }
    }).catch(err => {
        console.error('Error fetching active journey', err);
        return res.status(500).send('Internal server error');
    });
});

router.get('/personalStats', (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    return res.render('pages/personalStats.ejs', {
        user: req.user
    });
});

router.use(express.static('public'));

export default router;
