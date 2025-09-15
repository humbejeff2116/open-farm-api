import { cacheInterfaceHelpers } from "../../../../cache/lib/index.js";

const USERS = "users";
const usersCacheInterface = {
    async getUsers() {
        return await cacheInterfaceHelpers.get(USERS, null);
    },
    async setUsers(users, expireAfter?: number) {
        return await cacheInterfaceHelpers.put(USERS, null, users, expireAfter);
    },
    async removeUsers() {
        return await cacheInterfaceHelpers.remove(USERS, null);
    },
    async getUser(key) {
        return await cacheInterfaceHelpers.get(USERS, key);
    },
    async setUser(user, expireAfter?: number) {
        const { _id } = user;
        return await cacheInterfaceHelpers.put(USERS, _id, user, expireAfter);
    },
    async removeUser(key) {
        return await cacheInterfaceHelpers.remove(USERS, key);
    }
}

export default usersCacheInterface;