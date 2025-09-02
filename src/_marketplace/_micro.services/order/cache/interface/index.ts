import { cacheInterfaceHelpers } from "../../../../../_core/cache/lib/index.js";
import { TradeOrder } from "../../types/index.js";

const ORDERS = "orders";
const orderCacheInterface = {
    async getOrders() {
        return await cacheInterfaceHelpers.get(ORDERS, null);
    },
    async setOrders(orders, expireAfter?: number) {
        return await cacheInterfaceHelpers.put(ORDERS, null, orders, expireAfter);
    },
    async removeOrders() {
        return await cacheInterfaceHelpers.remove(ORDERS, null);
    },
    async getOrder(key) {
        return await cacheInterfaceHelpers.get(ORDERS, key);
    },
    async setOrder(order: TradeOrder, expireAfter?: number) {
        const { _id } = order;
        const id = String(_id);
        return await cacheInterfaceHelpers.put(ORDERS, id, order, expireAfter);
    },
    async removeOrder(key) {
        return await cacheInterfaceHelpers.remove(ORDERS, key);
    }
}

export default orderCacheInterface;