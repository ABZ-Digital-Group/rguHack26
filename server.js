import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';

import router from './router.js';
import { client, db } from './database.js';
import { authenticateToken } from './api/auth.js';

client.connect().then(() => {
    console.log('✅ Connected to MongoDB');
}).catch(err => {
    console.error('❌ Failed to connect to MongoDB', err);
    process.exit(1);
});



const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(authenticateToken);

app.use('/', router);

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`)
});
