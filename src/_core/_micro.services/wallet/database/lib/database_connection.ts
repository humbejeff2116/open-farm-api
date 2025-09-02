import mongoose from 'mongoose';
// import { MongoDbOptions } from "../configs/index.js";
import configs from '../configs/index.js';

export const dbTypes = {
    mongoDB: 'mongoDb',
    postgresql: 'postgresql'
}

const DBConection = {
    async connectToMongoDB(ODM: any, URI: string) { 
        // ODM.set('strictQuery', false)
        ODM.set('strictQuery', true);
        try {
            await ODM.connect(URI);
            console.log(`connection to mongo database established`);
        } catch (err) {
            console.error(`Error while connecting to mongo database`);
            throw err;
        }
    },
    connectToPostgresql() {
        console.log("TODO... implement  conection here")
    }
}

export default async function connectToDatabase(database: string) {
    const mongoURI = configs.db.mongoDatabaseURI();

    switch (database) {
        case dbTypes.mongoDB:
            DBConection.connectToMongoDB(mongoose, mongoURI);
            break;
        case dbTypes.postgresql:
            DBConection.connectToPostgresql();
            break;
        default:
            DBConection.connectToMongoDB(mongoose, mongoURI);
            break;
    }
}