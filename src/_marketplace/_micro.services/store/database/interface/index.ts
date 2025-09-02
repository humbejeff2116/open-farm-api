import { Types } from 'mongoose';
import StoreModel from '../models/index.js';
import storeProductDbInterface from './product/index.js';
import storeCollectionDbInterface from './collection/index.js';
import storeProductReviewDbInterface from './review/index.js';
import { updateStoreDbOptions } from '../../constants/index.js';
import storeWalletDbInterface from './wallet/index.js';
import { Store, StoreCollection1, StoreTradeManager } from '../../types/index.js';

const storeManagementDbInterface = {
    async createStore(store: Store) { 
        try {
            const createStore = await StoreModel.createStore(store);
            return createStore;
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },

    async  getAllStores() {
        try {
            const stores = await StoreModel.getAll();
            return stores;
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },
    async  getStoreById(id: Types.ObjectId | string) {
        try {
            const store = await StoreModel.getById(id);
            return store;
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },

    async  getVendorStores(vendorId: Types.ObjectId | string) {
        try {
            const stores = await StoreModel.getVendor(vendorId);
            return stores;
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },

    async updateStoreType(storeId: Types.ObjectId | string, storeType: string) {
        try {
            const store = await StoreModel.updateType(storeId, storeType);
            return store;
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },
    async addStoreCollection(storeId: Types.ObjectId | string, collection: StoreCollection1) {
        try {
            const store = await StoreModel.addCollection(storeId, collection);
            return store;
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },

    async setStoreTradeManager(storeId: Types.ObjectId | string, tradeManager: StoreTradeManager) {
        try {
            const store = await StoreModel.setTradeManager(storeId, tradeManager);
            return store;
        } catch (err) {
            console.error(err);
            throw err;
        }  
    },

    async updateStore(
        option: string, 
        storeId: Types.ObjectId | string, 
        collection: StoreCollection1, 
        tradeManager: StoreTradeManager
    ) {
        switch (option) {
            
            case updateStoreDbOptions.collectionAndTradeManager:
                return await StoreModel.updateCollectionAndTradeManager(
                    storeId, 
                    collection, 
                    tradeManager
                ); 
            default:
                break;
        }

    }
}

export default storeManagementDbInterface;
export {
    storeProductDbInterface,
    storeCollectionDbInterface,
    storeProductReviewDbInterface,
    storeWalletDbInterface 
}