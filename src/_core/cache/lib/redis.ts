import redis from "redis";
import configs from "../configs/index.js";

const redisInterface = {
    _client: redis.createClient({
        socket: {
            host: configs.redis.hostname,
            port: configs.redis.port
        },
        // password: '<password>'
    }),
    _connected: false,
    _keys: {},
     
    connect() {
        this._client.connect();

        this._client.on('ready', () => {
            console.log('redis client connected --cache(lib-redis)');
            this._connected = true;
        })
        
        this._client.on('error',( err: any) => {
            console.log('Error --cache(lib-redis)' + err);
        });
        return this;
    },
    getConnection() {
        return this._connected;
    },
    getClient() {
        return this._client;
    },
    async exists(key: any) {
        try {
            const exists = await this._client.exists(key);
            return exists;   
        } catch (err) {
            console.error(err);
            throw new Error("Error occured checking cache key"); 
        }
    },
    async put(key: string, data: any) {
        if (!data) {
            return;
        }
        
        this._client.set(key, JSON.stringify(data))
        .then((res: any) => {
            console.log(`cache set status: ${res}`);
        })
        .catch((err: any) => {
            console.error(err);
            throw new Error("Error occured putting data to cache");
        });
    },
    async get(key: string) {
        try {
            const data = await this._client.get(key);
            return data;
        } catch (err) {
            console.error(err);
            throw new Error("Error occured getting cache data");
        }
    },
    async delete(key: string) {
        try {
            const del = await this._client.del(key);
            return del;    
        } catch (err) {
            console.error(err);
            throw new Error("Error occured whele deleting from cache");
        }
    },
    async flush() {//Deletes all the keys of the currently selected DB
        this._client.flushDb()
        .then((res: any) => {
            console.log(`flushed db status: ${res}`);
        })
        .catch((err: any) => {
            console.error(err);
            throw new Error("Error occured while flushing cache");
        })
    },
    expire(key: string, time: number) {
            this._client.expire(key, time)
            .then((res: any) => {
                console.log(`cache expire time set ${res}`);
            })
            .catch((err: any) => {
                console.error(err);
                throw new Error("error occured while setting cache expire time");
            }) 
    }
}
export default redisInterface;