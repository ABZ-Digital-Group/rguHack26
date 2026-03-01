import express from 'express';

import { authRouter } from './auth.js';
import routesRouter from './route.js';
import journeyRouter from './journey.js';
import weatherRouter from './weather.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/routes', routesRouter);
router.use('/journey', journeyRouter);
router.use('/weather', weatherRouter);

export default router;
