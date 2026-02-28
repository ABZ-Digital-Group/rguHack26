import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const dbName = 'transition';
const mongoURI = process.env.MONGO_URI;
const client = new MongoClient(mongoURI);

const db = client.db(dbName);

export { client, db };