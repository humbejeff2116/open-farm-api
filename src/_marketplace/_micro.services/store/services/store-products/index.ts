import { Types } from "mongoose";
import { StoreProduct, StoreProductLike } from "../../types/index.js";
import { storeProductDbInterface } from "../../database/interface/index.js";

const storeProductService = {
    async createStoreProduct(product: StoreProduct) { 
        try {
            const productRes = await storeProductDbInterface.createProduct(product);
            
            return ({
                success: true,
                status: 200,
                error: false,
                message: 'product created succesfully',
                data: productRes,
            })
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },

    async getStoreProducts(storeId: Types.ObjectId | string) {
        try {
            const products = await storeProductDbInterface.getAllStoreProducts(storeId);
            return products;
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
            const product = await storeProductDbInterface.getStoreProduct(storeId, productId);
            return product;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getStoreCollectionProducts(
        storeId: Types.ObjectId | string,
        collectionId: Types.ObjectId | string,
    ) {
        try {
            const products = await storeProductDbInterface.getAllStoreCollectionProducts(storeId, collectionId);
            return products;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getProductsWithLimitAndSkip(limit: number, skip: number) {
        try {
            const products = await storeProductDbInterface.getWithLimitAndSkip(limit, skip);
            return products;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async likeProduct(
        productId: Types.ObjectId | string, 
        userLike: StoreProductLike
    ) {
        const { like } = userLike;

        try {

            if (!await storeProductDbInterface.storeProductExist(productId)) {
                return ({
                    success: false,
                    error: false,
                    status: 400,
                    message: 'store product does not exist'
                })
            }
            if (!like) {
                const likeResponse = await storeProductDbInterface.removeProductLike(productId, userLike);
                
                return ({
                    ...likeResponse,
                    message: 'Removed product like succesfully',
                })
            }

            const likeResponse = await storeProductDbInterface.likeProduct(productId, userLike);
            return ({
                ...likeResponse,
                message: 'product liked succesfully'
            })
        } catch (err) {
            console.error(err);
            throw err;
        }

    },

    async updateProduct<Type>(
        productId: Types.ObjectId | string, 
        key: string, 
        newValue: Type
    ) {
        try {
            if (!await storeProductDbInterface.storeProductExist(productId)) {
                return ({
                    success: false,
                    error: false,
                    status: 400,
                    message: 'store product does not exist',
                    data: null
                })
            }
            const updateResponse = await storeProductDbInterface.updateProduct(productId, key, newValue);

            return ({
                ...updateResponse,
                message: 'store product updated successfully',
            })
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async removeProduct(productId: Types.ObjectId | string) {
        try {
            if (!await storeProductDbInterface.storeProductExist(productId)) {
                return ({
                    success: false,
                    error: false,
                    status: 400,
                    message: 'store product does not exist',
                    data: null
                })
            }
            const removeResponse = await storeProductDbInterface.removeProduct(productId);
            return ({
                ...removeResponse,
                message: 'store product removed successfully',
            })
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}


export default storeProductService;