import { Types } from "mongoose";
import storeCollectionService from "./store-collections/index.js";
import storeProductService from "./store-products/index.js";
import storeReviewService from "./store-product-reviews/index.js";
import storeWalletService from "./store-wallet/index.js";
import { updateStoreDbOptions } from "../constants/index.js";
// import tradeManagementService from "../../trade/services/index.js";
import storeManagementDbInterface from "../database/interface/index.js";
import type { Store, StoreCollection1, StoreTradeManager } from "../types/index.js";


const  storeService = {
    ...storeProductService,
    ...storeReviewService,
    ...storeCollectionService,
    ...storeWalletService, 
    async setUpStore(store: Store) {
        try {
            const vendorId = store.vendorId;
            // TODO... replace all storeManagementService with this
            const {data:vendorStore} = await storeService.createStore(store);
            const storeId = vendorStore._id;
            const tradeManager = {
                vendorId: vendorId,
                storeId: storeId,
            }
            const defaultStoreCollection = {
                name: 'default', 
                vendorId: vendorId,
                storeId: storeId,
            }

            const [
                {data:storeTradeManager}, 
                {data:storeWallet}, 
                {data:storeCollection}
            ] = await Promise.all([
                tradeManagementService.createStoreTradeManager(tradeManager),
                storeService.createStoreWallet(vendorId, storeId),
                storeService.createStoreCollection(defaultStoreCollection)
            ])
            // update vendor store with collection and trade manager in background
            storeService.updateStore(
                updateStoreDbOptions.collectionAndTradeManager,
                storeId, 
                {id: storeCollection._id}, 
                {id: storeTradeManager._id}
            )
            return ({
                status: 201,
                data: {
                    store: vendorStore,
                    wallet: storeWallet,
                } 
            })
        } catch (err) {
            console.error(err);  
        }
    },

    async createStore(store: Store) { 
        try {
            const storeRes = await storeManagementDbInterface.createStore(store);
            
            return ({
                success: true,
                error: false,
                status: 200,
                message: 'Store created successfully',
                data: storeRes,
            })
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },

    async getStore(storeId: Types.ObjectId | string) {
        try {
            const store = await storeManagementDbInterface.getStoreById(storeId);
            return store;  
        } catch (err) {
            console.error(err);
            
        }
    },

    async getVendorStores(vendorId: Types.ObjectId | string) {
        try {
            const stores = await storeManagementDbInterface.getVendorStores(vendorId);
            return stores;  
        } catch (err) {
            console.error(err);  
        }
    },

    async updateStoreType(
        storeId: Types.ObjectId | string, 
        storeType: string
    ) {
        try {

            if (!await storeService.getStore(storeId)) {
                return ({
                    success: false,
                    status: 400,
                    message: 'Store not found',
                    data: null
                })
            }
            const store = await storeManagementDbInterface.updateStoreType(storeId, storeType);
            return ({
                ...store,
                message: 'Updated store type successfully',
            })
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },

    async addStoreCollection(
        storeId: Types.ObjectId | string,
         collection: StoreCollection1
        ) {
        try {
            if (!await storeService.getStore(storeId)) {
                return ({
                    success: false,
                    status: 400,
                    message: 'Store not found',
                    data: null
                })
            }

            const store = await storeManagementDbInterface.addStoreCollection(storeId, collection);
            return ({
                ...store,
                message: 'Store collection added successfully',
            })
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },

    async setStoreTradeManager(
        storeId: Types.ObjectId | string, 
        tradeManager: StoreTradeManager
    ) {
        try {
            if (!await storeService.getStore(storeId)) {
                return ({
                    success: false,
                    status: 400,
                    message: 'Store not found',
                    data: null
                })
            }

            const store = await storeManagementDbInterface.setStoreTradeManager(storeId, tradeManager);
            return ({
                ...store,
                message: 'Store trade manager set successfully',
            })
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
            
            case updateStoreDbOptions.collectionAndTradeManager: {
                if (!await storeService.getStore(storeId)) {
                    return ({
                        success: false,
                        status: 400,
                        message: 'Store not found',
                        data: null
                    })
                }

                const store = await storeManagementDbInterface.updateStore(
                    option,
                    storeId, 
                    collection, 
                    tradeManager
                );
                return ({
                    ...store,
                    message: `Store trade manager updated successfully`,
                })  
            }
                
            default:
                throw new Error('invalid option parameter');
        }
    }
}

export default storeService;