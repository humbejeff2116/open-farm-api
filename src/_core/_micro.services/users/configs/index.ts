
import { config } from "dotenv";config();

interface App {
    port: number,
    url: string
}

interface Secret {
    cookieSecret: string,
    sessionSecret: string,
    jwtSecret: string,
    pssrptJwtSecret: string
}

interface Cloudinary {
    cloudName: string,
    apiKey: string,
    secret: string,
    url: string
}

interface CorsOptions {
    credentials: boolean
    origin: string
    optionsSuccessStatus: number
}

interface Config {
    app: App,
    secret: Secret,
    cloudinary: Cloudinary,
    corsOptions: CorsOptions
}

const configs: Config = {
    app: {
        port: parseInt(process.env.API_PORT),
        url: process.env.SITE_URL
    },
    secret: {
        cookieSecret: process.env.COOKIE_SECRET,
        sessionSecret: process.env.SESSION_SECRET,
        jwtSecret: process.env.JWT_SECRET,
        pssrptJwtSecret: process.env.PSSRPT_JWT_SECRET
    },
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_KEY,
        secret: process.env.CLOUDINARY_SECRET,
        url: `cloudinary://${process.env.CLOUDINARY_KEY}:${process.env.CLOUDINARY_SECRET}@${process.env.CLOUDINARY_CLOUD_NAME}`
    },
    corsOptions: {
        credentials: true,
        origin: 'http://localhost:3000',
        optionsSuccessStatus: 200
    }
}
export default configs;