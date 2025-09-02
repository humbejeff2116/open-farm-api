// import { config } from "dotenv";config();


interface Mongo {
    connectionURL: string
}

interface Redis {
    connectionURL: string
}

interface Config {
    mongoSession: Mongo,
    redisSession: Redis
}

const configs: Config = {
    mongoSession: {
        connectionURL: `mongodb://${process.env.MONGO_DB_HOST}:${process.env.MONGO_DB_PORT}/${process.env.MONGO_DB_NAME}`,
    },
    redisSession: {
        connectionURL: ``
    }
}
export default configs;