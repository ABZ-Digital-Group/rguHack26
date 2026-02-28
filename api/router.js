import express from 'express';

import { authRouter } from './auth.js';
import routesRouter from './route.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/routes', routesRouter);

export default router;
