import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import api_router from './api/router.js';

import { client, db } from './database.js';

client.connect().then(() => {
    console.log('✅ Connected to MongoDB');
}).catch(err => {
    console.error('❌ Failed to connect to MongoDB', err);
    process.exit(1);
});

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static('public'));
app.use('/api', api_router);

app.get('/', (req, res) => {
    res.render('pages/index.ejs');
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`)
});


app.get('/ping', (req, res) => {
    res.send(`<h1>System Diagnostic</h1><p><b>DB Status:</b> ${connectionStatus}</p><p><b>DB Connected:</b> ${db !== null}</p><p><b>Error Details:</b> <span style="color:red">${connectionError || 'None'}</span></p>`);
});