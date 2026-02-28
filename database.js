import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const dbName =process.env.DB_NAME || 'rguHack26'; 
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error('❌ MONGO_URI is not defined in .env file');
    process.exit(1);
}

const client = new MongoClient(mongoURI, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    retryWrites: true,
    retryReads: true,
    maxPoolSize: 10,
    minPoolSize: 1,
});

const db = client.db(dbName);

export { client, db };