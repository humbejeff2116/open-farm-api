import { Types } from "mongoose";
import { StoreCollection, StoreCollectionProduct } from "../../types/index.js";
import { storeCollectionDbInterface } from "../../database/interface/index.js";

const storeCollectionService = {
    async createStoreCollection(collection: StoreCollection) { 
        try {
            const collectionRes = await storeCollectionDbInterface.createCollection(collection);
            return ({
                success: true,
                error: false,
                status: 200,
                message: 'store collection created',
                data: collectionRes,
            })
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },

    async getStoreCollection(collectionId: Types.ObjectId | string) {
        try {
            const collection = await storeCollectionDbInterface.getCollection(collectionId);
            return collection;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getStoreCollections(storeId: Types.ObjectId | string) {
        try {
            const collections = await storeCollectionDbInterface.getStoreCollections(storeId);
            return collections;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async addStoreCollectionProduct(
        collectionId: Types.ObjectId | string,
        userId: Types.ObjectId | string,
        product: StoreCollectionProduct
    ) {
        try {
            const response = await storeCollectionDbInterface.addCollectionProduct(
                collectionId, 
                userId, 
                product
            );

            return ({
                ...response,
                message: 'store collection added successfully',
            })
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },

    async removeStoreCollection(
        collectionId: Types.ObjectId | string, 
        storeId: Types.ObjectId | string
    ) {
        try {
            const removeResponse = await storeCollectionDbInterface.removeCollection(collectionId, storeId);
            return ({
                ...removeResponse,
                message: 'Store collection removed successful',
            })
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async removeStoreCollectionProduct(
        collectionId: Types.ObjectId | string, 
        storeId: Types.ObjectId | string,
        productId: Types.ObjectId | string
    ) {
        try {
            const removeResponse = await storeCollectionDbInterface.removeCollectionProduct(collectionId, storeId, productId);
            return ({
                ...removeResponse,
                message: 'Store collection product removed',
            })
        } catch (err) {
            console.error(err);
            throw err;
        }
    },
}

export default storeCollectionService;