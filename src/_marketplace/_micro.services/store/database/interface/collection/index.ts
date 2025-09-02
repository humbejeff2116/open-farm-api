import { Types } from 'mongoose';
import StoreCollectionModel from '../../models/collection/index.js';
import { 
    StoreCollection, 
    StoreCollectionProduct 
} from '../../../types/index.js';

const collectionDbInterface = {
    async createCollection(collection: StoreCollection) { 
        try {
            const collectionRes = await StoreCollectionModel.createStoreCollection(collection);
            return collectionRes;
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },
    
    async addCollectionProduct(
        collectionId: Types.ObjectId | string,
        storeId: Types.ObjectId | string,
        product: StoreCollectionProduct
    ) {
        try {
            const response = await StoreCollectionModel.addProduct(collectionId, storeId, product);
            return response;
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },

    async getCollection(collectionId: Types.ObjectId | string) {
        try {
            const collection = await StoreCollectionModel.get(collectionId);
            return collection;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getStoreCollections(storeId: Types.ObjectId | string) {
        try {
            const collection = await StoreCollectionModel.getStoreCollections(storeId);
            return collection;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async removeCollection(
        collectionId: Types.ObjectId | string, 
        storeId: Types.ObjectId | string
    ) {
        try {
            const removeResponse = await StoreCollectionModel.remove(collectionId, storeId);
            return removeResponse;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async removeCollectionProduct(
        collectionId: Types.ObjectId | string, 
        storeId: Types.ObjectId | string,
        productId: Types.ObjectId | string
    ) {
        try {
            const removeResponse = await StoreCollectionModel.removeProduct(collectionId, storeId, productId);
            return removeResponse;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}

export default collectionDbInterface;