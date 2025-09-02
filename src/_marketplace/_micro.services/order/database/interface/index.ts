import { Types } from 'mongoose';
import { TradeOrder } from '../../types/index.js';
import OrderModel from '../models/index.js';

const orderDbInterface = {
    async createTradeOrder(order: TradeOrder) { 
        try {
            const orderRes = await OrderModel.createOrder(order);
            return orderRes;
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },

    async getAllOrders() {
        try {
            const products = await OrderModel.getAll();
            return products;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getOrder(orderId: Types.ObjectId | string) {
        try {
            const order = await OrderModel.getOrder(orderId);
            return order;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getStoreOrders(storeId: Types.ObjectId | string) {
        try {
            const orders = await OrderModel.getStoreOrders(storeId);
            return orders;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getBuyerOrders(accountId: Types.ObjectId | string) {
        try {
            const orders = await OrderModel.getBuyerOrders(accountId);
            return orders;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getOrdersWithLimitAndSkip(limit: number, skip: number) {
        try {
            const orders = await OrderModel.getWithLimitAndSkip(limit, skip);
            return orders;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async updateOrder<Type>(
        orderId: Types.ObjectId | string, 
        key: string, 
        newValue: Type
    ) {
        try {
            const updateResponse = await OrderModel.updateOrder(orderId, key, newValue);
            return updateResponse;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async removeOrder(
        orderId: Types.ObjectId | string, 
    ) {
        try {
            const removeResponse = await OrderModel.removeOrder(orderId);
            return removeResponse;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }  
}

export default orderDbInterface;