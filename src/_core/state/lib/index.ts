// import { mongoSessionStore, redisSessionStore } from "./connection.js";


// TODO... remove this module as session connection is moved to cache and only using redis

interface SessionType {
    redis: string;
    mongo: string
}

export const sessionType: SessionType = {
    redis: 'redis',
    mongo: 'mongo'
}

// export const sessionStore = {
//     redis: redisSessionStore,
//     mongo: mongoSessionStore
// }

export const sessionStore = {
    redis: {},
    mongo: {}
}

export function setSessionType(type: string) {
    switch (type) {
        case sessionType.redis:
            return sessionStore.redis
        case sessionType.mongo:
            return sessionStore.mongo
        default:
            throw new Error('session type not specified or available')
    }
}