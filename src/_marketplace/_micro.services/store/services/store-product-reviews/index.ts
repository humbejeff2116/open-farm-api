import { Types } from "mongoose";
import { StoreProductReview, StoreProductReviewer } from "../../types/index.js";
import { storeProductReviewDbInterface } from "../../database/interface/index.js";

const storeReviewService = {
    async reviewProduct(review: StoreProductReview) {
        const { buyerId, productId } = review;

        try {
            const userProdReview = storeProductReviewDbInterface.getBuyerProductReview(buyerId, productId);
            if (userProdReview) {
                return ({
                    success: false,
                    error: false,
                    status: 400,
                    message: 'Product review already exist',
                    data: null
                })
            }

            const reviewRes = await storeProductReviewDbInterface.createProductReview(review);
            return ({
                success: true,
                error: false,
                status: 200,
                message: 'Product reviewed successfully',
                data: reviewRes
            });
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },

    async getAllReviews() {
        try {
            const reviews = await storeProductReviewDbInterface.getAllReviews();
            return reviews;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getReview(id: Types.ObjectId | string) {
        try {
            const review = await storeProductReviewDbInterface.getReview(id);
            return review;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getBuyerReviews(accountId: Types.ObjectId | string) {
        try {
            const reviews = await storeProductReviewDbInterface.getBuyerReviews(accountId);
            return reviews;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getBuyerProductReview(
        accountId: Types.ObjectId | string, 
        productId: Types.ObjectId | string
    ) {
        try {
            const review = await storeProductReviewDbInterface.getBuyerProductReview(accountId, productId);
            return review;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getProductReviews(productId: Types.ObjectId | string) {
        try {
            const productReviews = await storeProductReviewDbInterface.getProductReviews(productId);
            return productReviews;
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

            if (!await storeProductReviewDbInterface.getReview(reviewId)) {
                return ({
                    success: false,
                    error: false,
                    status: 400,
                    message: 'Review does not exist'
                })
            }

            const updateResponse = await storeProductReviewDbInterface.updateReview(reviewId, key, value);
            return ({
                ...updateResponse,
                message: 'Review updated succesfully',
            })
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
            const review = await storeProductReviewDbInterface.getReview(reviewId);

            if (!review) {
                return ({
                    success: false,
                    error: false,
                    status: 400,
                    message: 'Review does not exist'
                })
            }

            if (!review.accountFoundInHelpful(helpful.accountId)) {
                const addHelpfulResponse = await storeProductReviewDbInterface.addReviewHelpful(reviewId, helpful);
                return ({
                    ...addHelpfulResponse,
                    message: 'Review helpful added successfully'
                })
            }

            // return if helpful have already been added
            return ({
                success: true,
                error: false,
                status: 201,
                message: 'Review helpful already exist'
            })

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
            const review = await storeProductReviewDbInterface.getReview(reviewId);

            if (!review) {
                return ({
                    success: false,
                    error: false,
                    status: 400,
                    message: 'Review does not exist'
                })
            }

            if (!review.accountFoundInNotHelpful(notHelpful.accountId)) {
                const addNotHelpfulResponse = await storeProductReviewDbInterface.addReviewNotHelpful(reviewId, notHelpful);
                return ({
                    ...addNotHelpfulResponse,
                    message: 'Review not helpful added successful'
                })
            }
            // return if not helpful have already been added 
            return ({
                success: true,
                error: false,
                status: 201,
                message: 'Review not helpful already exist'
            })
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
            const review = await storeProductReviewDbInterface.getReview(reviewId);

            if (!review) {
                return ({
                    success: false,
                    error: false,
                    status: 400,
                    message: 'Review does not exist'
                })
            }
            if (review.accountFoundInHelpful(helpful.accountId)) {
                const removeHelpfulResponse = await storeProductReviewDbInterface.removeReviewHelpful(reviewId, helpful);
                return ({
                    ...removeHelpfulResponse,
                    message: 'Removed review helpful successfully'
                })
            }
            // return if review helpful does not exist
            return ({
                success: true,
                error: false,
                status: 201,
                message: 'Review helpful does not exist'
            })
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
            const review = await storeProductReviewDbInterface.getReview(reviewId);

            if (!review) {
                return ({
                    success: false,
                    error: false,
                    status: 400,
                    message: 'Review does not exist'
                })
            }

            if (review.accountFoundInNotHelpful(notHelpful.accountId)) {
                const removeNotHelpfulResponse = await storeProductReviewDbInterface.removeReviewNotHelpful(reviewId, notHelpful);
                return ({
                    ...removeNotHelpfulResponse,
                    message: 'Removed review not helpful successfully'
                })
            }

            // return if review not helpful does not exist
            return ({
                success: true,
                error: false,
                status: 201,
                message: 'Review not helpful does not exist'
            })
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async removeReview(reviewId: Types.ObjectId | string) {
        try {
            const review = await storeProductReviewDbInterface.getReview(reviewId);

            if (!review) {
                return ({
                    success: false,
                    error: false,
                    status: 400,
                    message: 'Review does not exist'
                })
            }
            const removeResponse = await storeProductReviewDbInterface.removeReview(reviewId);
            return ({
                ...removeResponse,
                message: 'Review removed successfully'
            })
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}

export default storeReviewService;