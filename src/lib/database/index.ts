// import mongoose from 'mongoose';
// import configs from '../../configs/index.js';
// // import { MongoDbOptions } from "../configs/index.js";
// // import configs from '../configs/index.js';

// export const dbTypes = {
//     mongoDB: 'mongoDb',
//     postgresql: 'postgresql'
// }

// const dbconnection = {
//     state: 0
// };


// const DBConection = {
//     async connectToMongoDB() {
//         const mongoURI = configs.db.mongoDatabaseURI();
//         if (dbconnection.state) {
//             console.log('connection to mongoDb already established');
//             return;
//         }

//         try {

//             mongoose.set('strictQuery', true);
//             const db = await mongoose.connect(mongoURI);
//             dbconnection.state = db.connection.readyState;
//             console.log('connection to mongoDb established');

//         } catch (err) {
//             dbconnection.state = 0;
//             console.error(`Error while connecting to mongoDB database`);
//             throw err
//         }
//     },
//     connectToPostgresql() {
//         console.log("TODO... implement  conection here");
//     }
// }

// export default async function connectToDatabase(databaseType: string) {


//     switch (databaseType) {
//         case dbTypes.mongoDB:
//             DBConection.connectToMongoDB();
//             break;
//         case dbTypes.postgresql:
//             DBConection.connectToPostgresql();
//             break;
//         default:
//             DBConection.connectToMongoDB();
//             break;
//     }
// }