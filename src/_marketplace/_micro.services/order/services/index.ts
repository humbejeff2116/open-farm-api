import { Types } from "mongoose";
import orderDbInterface from "../database/interface/index.js";
import type { TradeOrder, TradeOrderProduct } from "../types/index.js";
// import { productService } from "../../../services/index.js";

const orderService = {
    async placeOrder(order: TradeOrder) { 
        try {
            const orderRes = await orderDbInterface.createTradeOrder(order);
            return ({
                success: true,
                error: false,
                status: 200,
                message: 'Place order succesful',
                data: orderRes,
            })
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },

    async getAllOrders() {
        try {
            const orders = await orderDbInterface.getAllOrders();
            return orders;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getOrdersWithLimitAndSkip(limit: number, skip: number) {
        try {
            const orders = await orderDbInterface.getOrdersWithLimitAndSkip(limit, skip);
            return orders;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getOrder(orderId: Types.ObjectId | string) {
        try {
            const order = await orderDbInterface.getOrder(orderId);
            return order;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getStoreOrders(storeId: Types.ObjectId | string) {
        try {
            const orders = await orderDbInterface.getStoreOrders(storeId);
            return orders;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getBuyerOrders(accountId: Types.ObjectId | string) {
        try {
            const orders = await orderDbInterface.getBuyerOrders(accountId);
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
            if (!await this.getOrder(orderId)) {
                return ({
                    success: false,
                    error: false,
                    status: 400,
                    message: 'Order does not exist',
                    data: null,
                })
            }
            const updateResponse = await orderDbInterface.updateOrder(orderId, key, newValue);
            return ({
                ...updateResponse,
                message: 'Order updated successfully',
            });
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async removeOrder(orderId: Types.ObjectId | string) {
        try {
            if (!await this.getOrder(orderId)) {
                return ({
                    success: false,
                    error: false,
                    status: 400,
                    message: 'Order does not exist',
                    data: null,
                })
            }

            const removeResponse = await orderDbInterface.removeOrder(orderId);
            return ({
                ...removeResponse,
                message: 'Order removed successfully',
            })
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async patchOrder(orders: Array<TradeOrder>) {
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const prodDetails = await this._getProductsDetails(order.products);
            order.products = prodDetails;
        }
        return orders;
    },

    async _getProductsDetails(products: Array<TradeOrderProduct>) {
        const newProds = [];
    
        for (let i = 0; i < products.length; i++) {
            const product = await productService.get(products[i].productId)
            newProds.push({...product, ...products[i]})
        } 
        return newProds;
    },

    async _getProductsDetails2(products: Array<TradeOrderProduct>) {
        const newProds = [];

        return new Promise((res, rej) => {
            for (let i = 0; i < products.length; i++) {
                try {
                    productService.get(products[i].productId)
                    .then(product => {
                        newProds.push({...product, ...products[i]});
    
                        if (newProds.length === products.length) {
                            res(newProds);
                        }
                    })  
                } catch (err) {
                    rej(err);
                }
            }
        })
    }
}

export default orderService;