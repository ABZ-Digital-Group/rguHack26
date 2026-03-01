import express from 'express';

import { authRouter } from './auth.js';
import routesRouter from './route.js';
import journeyRouter from './journey.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/routes', routesRouter);
router.use('/journey', journeyRouter);

export default router;
