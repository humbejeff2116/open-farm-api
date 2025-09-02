import { Types } from 'mongoose';
import  ProductReviewModel from '../../models/review/index.js';
import { StoreProductReview, StoreProductReviewer } from '../../../types/index.js';
 

const storeProductReviewDbInterface = {
    async createProductReview(review: StoreProductReview) { 
        try {
            const reviewRes = await ProductReviewModel.createReview(review);
            return reviewRes;
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },

    async getAllReviews() {
        try {
            const reviews = await ProductReviewModel.getAll();
            return reviews;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getReview(id: Types.ObjectId | string) {
        try {
            const removeResponse = await ProductReviewModel.get(id);
            return removeResponse;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getBuyerReviews(buyerId: Types.ObjectId | string) {
        try {
            const reviews = await ProductReviewModel.getAllBuyer(buyerId);
            return reviews;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getBuyerProductReview(
        buyerId: Types.ObjectId | string, 
        productId: Types.ObjectId | string
    ) {
        try {
            const reviews = await ProductReviewModel.getBuyer(buyerId, productId);
            return reviews;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getProductReviews(productId: Types.ObjectId | string) {
        try {
            const allProductReviews = await ProductReviewModel.getProduct(productId);
            return allProductReviews;
        } catch (err) {
            console.error(err);
            throw err;
        }

    },

    async updateReview<Type>(
        reviewId: Types.ObjectId | string,  
        key: string, 
        value: Type
    ) {
        try {
            const updateResponse = await ProductReviewModel.update(reviewId, key, value);
            return updateResponse;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async addReviewHelpful(
        reviewId: Types.ObjectId | string, 
        helpful: StoreProductReviewer
    ) {
        try {
            const addHelpfulResponse = await ProductReviewModel.addHelpful(reviewId, helpful);
            return addHelpfulResponse;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async removeReviewHelpful(
        reviewId: Types.ObjectId | string, 
        helpful: StoreProductReviewer
    ) {
        try {
            const removeHelpfulResponse = await ProductReviewModel.removeHelpful(reviewId, helpful);
            return removeHelpfulResponse;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },
    
    async addReviewNotHelpful(
        reviewId: Types.ObjectId | string,
        notHelpful: StoreProductReviewer
    ) {
        try {
            const addNotHelpfulResponse = await ProductReviewModel.addNotHelpful(reviewId, notHelpful);
            return addNotHelpfulResponse;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async removeReviewNotHelpful(
        reviewId: Types.ObjectId | string,
        notHelpful: StoreProductReviewer
    ) {
        try {
            const removeNotHelpfulResponse = await ProductReviewModel.removeNotHelpful(reviewId, notHelpful);
            return removeNotHelpfulResponse;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async removeReview(id: Types.ObjectId | string) {
        try {
            const removeResponse = await ProductReviewModel.remove(id);
            return removeResponse;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }, 
    // async getUserHelpfulOrNotHelpfulReview(
    //     reviewId: Types.ObjectId | string, 
    //     userId: Types.ObjectId | string, 
    //     productId: Types.ObjectId | string,
    //     type: string
    // ) {
    //     try {
    //         const review = await ProductReviewModel.getUserHelpfulOrNotHelpfulReview(
    //             reviewId, 
    //             userId, 
    //             productId,
    //             type
    //         )
    //         return review;
    //     } catch (err) {
    //         console.error(err);
    //         throw err;
    //     }
    // }
}

export default storeProductReviewDbInterface;