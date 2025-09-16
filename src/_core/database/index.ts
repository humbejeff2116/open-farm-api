import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./drizzle/migrations/schema/index.js";
import mongoose from 'mongoose';


const mongoDBconnectionURI = {
    local: `mongodb://${process.env.MONGO_DB_HOST}:${process.env.MONGO_DB_PORT}/${process.env.MONGO_DB_NAME}`,
    cloud: `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@${process.env.MONGO_DB_CLUSTER_HOST}/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`
}

export const dbTypes = {
    mongoDB: 'mongoDb',
    postgresql: 'postgresql'
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Supabase connection string
});

export const db = drizzle(pool, { schema });

export async function connectToMongoDatabase() {
    const NODE_ENV = process.env.NODE_ENV;

    if (
        !process.env.MONGO_DB_HOST || 
        !process.env.MONGO_DB_PORT ||
        !process.env.MONGO_DB_NAME ||
        !process.env.MONGO_DB_USERNAME || 
        !process.env.MONGO_DB_PASSWORD ||
        !process.env.MONGO_DB_CLUSTER_HOST ||
        !process.env.MONGO_DB_NAME 
    ) {
        throw new Error('[database]:: mongoDB environmental variables not set');
    }
    try {
        mongoose.set('strictQuery', true);
        await mongoose.connect(NODE_ENV === 'production' ? mongoDBconnectionURI.cloud : mongoDBconnectionURI.local);
        console.log('[database]:: connection to mongoDb established');
    } catch (err) {
        console.error(`[database]:: Error while connecting to mongoDB database`);
        throw err;
    }
}
