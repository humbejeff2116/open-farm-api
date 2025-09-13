import redisInterface from "./redis.js";

interface CacheTypes {
    redis: string;
}

export const cacheTypes: CacheTypes = {
    redis: 'redis',
}
const cacheType = cacheTypes.redis;

export function connectToCacheStore() {
    switch (cacheType) {
        case cacheTypes.redis:
            return redisInterface.connect();
        default:
            return redisInterface.connect();
    }
    
}

export const cacheInterface = {
    redis: redisInterface
}

export function setCacheInterface(type: string) {
    switch (type) {
        case cacheTypes.redis:
            return cacheInterface.redis;
        default:
            return cacheInterface.redis;
    }
}

function generateCacheKey(type: string, key: string) {
    return `${type}-${JSON.parse(key)}`;
}

type CacheKeyType = string | null;
const cache = setCacheInterface(cacheType);
export const cacheInterfaceHelpers = {
    async flushCache() {
        return cache.flush();
    },
    async put<T>(section: string, key: CacheKeyType, data: T,  expireAfter?: number) {
        key = !key ? section : generateCacheKey(section, JSON.stringify(key));
        cache.put(key, data);
        this.expire(section, key, expireAfter);
    },
    async get(section: string, key: CacheKeyType) {
        let response;
        key = !key ? section : generateCacheKey(section, JSON.stringify(key));

        if (await cache.exists(key)) {
            response = await cache.get(key);
        } else {
            response = null;
        }
        return response;
    },
    async remove(section: string, key: CacheKeyType) {
        let response;
        key = !key ? section : generateCacheKey(section, JSON.stringify(key));

        if (await cache.exists(key)) {
            response = await cache.delete(key);
        } else {
            response = null;
        }
        return response;
    },
    async expire(section: string, key: CacheKeyType, expireAfter?: number) {
        key = !key ? section : generateCacheKey(section, JSON.stringify(key));
        cache.expire(key, expireAfter ?? 600);// 10 mins 60secs === 1min
    }
}