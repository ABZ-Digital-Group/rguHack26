require('dotenv').config();

// LOAD NPM PACKAGES
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb-legacy').MongoClient;

const app = express();
const PORT = process.env.PORT || 3000;
const dbname = 'transition';

// --- 4. DATABASE CONNECTION ---
let db = null;
let connectionError = null;
let connectionStatus = "Disconnected";

// 🚀 Ready-First Strategy: Listen immediately to pass Hostinger health checks
app.listen(PORT, () => {
    console.log(`✅ StockPlus listening on Port: ${PORT}`);
    connectDB();
});

async function connectDB() {
    const fallbackURI = "mongodb+srv://stuartiek_db_user:Zwq6xp7NR3Ho2W1W@cluster0.blmfv8d.mongodb.net/stockplus?retryWrites=true&w=majority";
    let url = process.env.MONGODB_URI || fallbackURI;

    try {
        connectionStatus = "Connecting...";
        const client = new MongoClient(url, { 
            connectTimeoutMS: 15000, 
            serverSelectionTimeoutMS: 15000,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        await client.connect();
        db = client.db(dbname);
        connectionError = null;
        connectionStatus = "Connected";
        console.log('✅ Connected Successfully to MongoDB Atlas');
    } catch (err) {
        connectionStatus = "Error";
        connectionError = `Atlas Connection Failed: ${err.message}`;
        console.error('❌ MongoDB Connection Error:', err.message);
    }
}
// APP CONFIG
app.use(session({ secret: 'example', resave: false, saveUninitialized: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// MIDDLEWARE (Unified)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// RENDER PAGES
app.get('/', (req, res) => res.render('pages/index'));


// 3. FIXED DATABASE CONNECTION & SERVER START (Only one app.listen)
async function connectDB() {
    try {
        await client.connect();
        db = client.db(dbname);
        console.log('Connected Successfully to MongoDB');
        
        const PORT = process.env.PORT || 3200;
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Database connection failed', err);
    }
}

connectDB();
