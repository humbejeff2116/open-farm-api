import { Types } from 'mongoose';
import ProductModel from '../../models/product/index.js';
import { StoreProduct, StoreProductLike } from '../../../types/index.js';

const productDbInterface = {
    async createProduct(product: StoreProduct) { 
        try {
            const productRes = await ProductModel.createProduct(product);
            return productRes;
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },

    async getAll() {
        try {
            const products = await ProductModel.getAll();
            return products;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async get(productId: Types.ObjectId | string) {
        try {
            const product = await ProductModel.get(productId);
            return product;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getWithLimitAndSkip(limit: number, skip: number) {
        try {
            const products = await ProductModel.getWithLimitAndSkip(limit, skip);
            return products;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async likeProduct(id: Types.ObjectId | string, userLike: StoreProductLike) {
        try {
            const likeResponse = await ProductModel.like(id, userLike);
            return likeResponse;
        } catch (err) {
            console.error(err);
            throw err;
        }

    },

    async removeProductLike(productId: Types.ObjectId | string, userLike: StoreProductLike) {
        try {
            const likeResponse = await ProductModel.like(productId, userLike);
            return likeResponse;
        } catch (err) {
            console.error(err);
            throw err;
        }

    },

    async updateProduct<Type>(productId: Types.ObjectId | string, key: string, newValue: Type) {
        try {
            const updateResponse = await ProductModel.update(productId, key, newValue);
            return updateResponse;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async removeProduct(productId: Types.ObjectId | string) {
        try {
            const removeResponse = await ProductModel.remove(productId);
            return removeResponse;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getAllStoreProducts(storeId: Types.ObjectId | string) {
        try {
            const response = await ProductModel.getAllStore(storeId);
            return response;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getAllStoreCollectionProducts(
        storeId: Types.ObjectId | string,
        collectionId: Types.ObjectId | string,
    ) {
        try {
            const response = await ProductModel.getAllStoreCollection(
                storeId,
                collectionId
            );
            return response;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getStoreProduct(
        storeId: Types.ObjectId | string,
        productId: Types.ObjectId | string,
    ) {
        try {
            const response = await ProductModel.getStore(
                storeId,
                productId
            )
            return response;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async storeProductExist(productId: Types.ObjectId | string) {
        try {
            const product = await ProductModel.get(productId);
            return product ? true : false;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}

export default productDbInterface;