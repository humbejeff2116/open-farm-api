import { config } from "dotenv";
config();


interface Redis {
    hostname: string,
    port: number,
    password?: string
}

interface Config {
    redis: Redis
}

const configs: Config = {
    redis: {
        hostname: process.env.REDIS_HOSTNAME || 'localhost',
        port: Number(process.env.REDIS_PORT)
    }
}
export default configs;