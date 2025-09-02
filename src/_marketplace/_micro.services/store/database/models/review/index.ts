import { Schema, model, Types, Model, HydratedDocument, } from 'mongoose';
import { StoreProductReview, StoreProductReviewer } from '../../../types/index.js';

// export interface ReviewUser {
//     buyerId: Types.ObjectId | string
// }

// export interface Review {
//     _id?: Types.ObjectId
//     buyerId: Types.ObjectId | string
//     vendorId: Types.ObjectId | string
//     productId: Types.ObjectId | string
//     starRating: number
//     review: string
//     timestamp: string | Date
//     helpful?: Array<ReviewUser>
//     notHelpful?: Array<ReviewUser>
//     createdAt?: Date
// }

interface Response {
    status: number,
    error: boolean, 
    data: unknown
}

interface ProductReviewMethods {
    accountFoundInNotHelpful(accountId: Types.ObjectId | string): boolean
    accountFoundInHelpful(accountId: Types.ObjectId | string): boolean
}

interface ProductReviewModelStatics extends Model<StoreProductReview, object, ProductReviewMethods> {
    createReview(review: StoreProductReview): Promise<HydratedDocument<StoreProductReview, ProductReviewMethods>>;
    getAll(): Promise<Array<HydratedDocument<StoreProductReview, ProductReviewMethods>>>; 
    getAllBuyer(buyerId: Types.ObjectId | string): Promise<Array<HydratedDocument<StoreProductReview, ProductReviewMethods>>>;
    getBuyer(buyerId: Types.ObjectId | string, productId: Types.ObjectId | string): Promise<HydratedDocument<StoreProductReview, ProductReviewMethods>>;
    getProduct(productId: Types.ObjectId | string): Promise<Array<HydratedDocument<StoreProductReview, ProductReviewMethods>>>;
    get(id: Types.ObjectId | string): Promise<HydratedDocument<StoreProductReview, ProductReviewMethods>>;
    addHelpful(reviewId: Types.ObjectId | string, helpful: StoreProductReviewer): Promise<Response>
    removeHelpful(reviewId: Types.ObjectId | string, helpful: StoreProductReviewer): Promise<Response>
    addNotHelpful(reviewId: Types.ObjectId | string, notHelpful: StoreProductReviewer): Promise<Response>
    removeNotHelpful(reviewId: Types.ObjectId | string, notHelpful: StoreProductReviewer): Promise<Response>
    update<Type>(
        reviewId: Types.ObjectId | string, 
        key: string, 
        value: Type
    ): Promise<Response>;
    remove(id: Types.ObjectId | string): Promise<Response>;
}

const ProductReviewSchema = new Schema<StoreProductReview, ProductReviewModelStatics, ProductReviewMethods>({
    buyerId: { type: String, required: true, unique: true },
    productId: { type: String, required: true, unique: true },
    starRating: { type: Number, required: true, unique: true },
    review: { type: String, required: true, unique: true },
    timestamp: { type: String , required: true, unique: true },
    helpful: [{}],
    notHelpful: [{}],
    createdAt: { type: Date, default: Date.now }
})


ProductReviewSchema.static('createReview', async function createReview(
    review: StoreProductReview
): Promise<HydratedDocument<StoreProductReview, ProductReviewMethods>> {
    console.log("review in model", review);

    return await this.create({ 
        buyerId: review.buyerId,
        productId: review.productId,
        starRating: review.starRating,
        review: review.review,
        timestamp: review.timestamp,
        helpful: review.helpful,
        notHelpful: review.notHelpful,
    });
});

ProductReviewSchema.static('getAll', async function getAll(

): Promise<Array<HydratedDocument<StoreProductReview, ProductReviewMethods>>> {
    const reviews = await this.find({});
    return reviews;
});

ProductReviewSchema.static('getAllUser', async function getAllUser(
    buyerId: Types.ObjectId | string
): Promise<Array<HydratedDocument<StoreProductReview, ProductReviewMethods>>> {
    const reviews = await this.find({buyerId: buyerId});
    return reviews;
});

ProductReviewSchema.static('getUser', async function getUser(
    buyerId: Types.ObjectId | string, 
    productId: Types.ObjectId | string
): Promise<HydratedDocument<StoreProductReview, ProductReviewMethods>> {
    const review = await this.findOne({$and: [{buyerId: buyerId}, {productId: productId}]});
    return review;
});

ProductReviewSchema.static('getProduct', async function getAllProduct(
    productId: Types.ObjectId | string
): Promise<Array<HydratedDocument<StoreProductReview, ProductReviewMethods>>> {
    const reviews = await this.find({productId: productId});
    return reviews;
});

ProductReviewSchema.static('get', async function get(
    id: Types.ObjectId | string
): Promise<HydratedDocument<StoreProductReview, ProductReviewMethods>> {
    const review = await this.findOne({ _id: id });
    return review;
});

ProductReviewSchema.static('addHelpful', async function addHelpful(
    buyerId: Types.ObjectId | string, 
    productId: Types.ObjectId | string, 
    helpful: StoreProductReviewer
): Promise<Response> {
    const updateReview = await this.updateOne(
        { $and: [{buyerId: buyerId}, {productId: productId}] }, 
        { $push: {helpful: helpful} }
    );
    return ({status: 201, error: false, data: updateReview});
});

ProductReviewSchema.static('removeHelpful', async function removeHelpful(
    buyerId: Types.ObjectId | string, 
    productId: Types.ObjectId | string, 
    helpful: StoreProductReviewer
): Promise<Response> {
    const updateReview = await this.updateOne(
        { $and: [{buyerId: buyerId}, {productId: productId}] }, 
        { $pull: {helpful: helpful.accountId} }
    );
    return ({status: 201, error: false, data: updateReview});
});

ProductReviewSchema.static('addNotHelpful', async function addNotHelpful(
    buyerId: Types.ObjectId | string, 
    productId: Types.ObjectId | string, 
    notHelpful: StoreProductReviewer
): Promise<Response> {
    const updateReview = await this.updateOne(
        { $and: [{buyerId: buyerId}, {productId: productId}] }, 
        { $push: {notHelpful: notHelpful} }
    );
    return ({status: 201, error: false, data: updateReview});
});

ProductReviewSchema.static('removeNotHelpful', async function removeNotHelpful(
    buyerId: Types.ObjectId | string, 
    productId: Types.ObjectId | string, 
    notHelpful: StoreProductReviewer
): Promise<Response> {
    const updateReview = await this.updateOne(
        { $and: [{buyerId: buyerId}, {productId: productId}] }, 
        { $pull: {notHelpful: notHelpful.accountId} }
    );
    return ({status: 201, error: false, data: updateReview});
});

// ProductReviewSchema.static('getUserHelpfulOrNotHelpfulReview', async function getUserHelpfulOrNotHelpfulReview(
//     reviewId: Types.ObjectId | string, 
//     buyerId: Types.ObjectId | string, 
//     productId: Types.ObjectId | string,
//     type: string
// ): Promise<HydratedDocument<Review, ProductReviewMethods>> {
//     const  UserHelpfulReview = async () => {
//         const review = await this.findOne(
//             {$and: [
//                 {_id: reviewId}, 
//                 {productId: productId},
//                 {"helpful.buyerId": buyerId}
//             ]}
//         );
//         return review;
//     }

//     const UserNotHelpfulReview = async () => {
//         const review = await this.findOne(
//             {$and: [
//                 {_id: reviewId}, 
//                 {productId: productId},
//                 {"notHelpful.buyerId": buyerId}
//             ]}
//         );
//         return review;
//     }

//     switch (type) {
//         case userIn.helpful:
//             return await UserHelpfulReview();
//         case userIn.notHelpful: 
//             return await UserNotHelpfulReview();
//         default:
//             throw new Error("");
//     }
// });

ProductReviewSchema.static('update', async function update<Type>(
    buyerId: Types.ObjectId | string, 
    productId: Types.ObjectId | string, 
    key: string, 
    newValue: Type
): Promise<Response> {
    const response = await this.updateOne(
        { $and: [{buyerId: buyerId}, {productId: productId}] },
        { "$set": {[key]: newValue} }
    );

    return ({status: 201, error: false, data: response});
});

ProductReviewSchema.static('remove', async function remove(
    id: Types.ObjectId | string
): Promise<Response> {
    const response = await this.findByIdAndDelete({ _id: id });
    return ({status: 201, error: false, data: response});
});



// instance methods 

ProductReviewSchema.method('accountFoundInHelpful', function accountFoundInHelpful(
    accountId: Types.ObjectId | string
) {
    const helpful = this.helpful;

    for (let i = 0; i < helpful.length; i++) {
        if (helpful[i].accountId === accountId) {
            return true;
        }
    }
    return false;
});

ProductReviewSchema.method('accountFoundInNotHelpful', function accountFoundInNotHelpful(
    accountId: Types.ObjectId | string
) {
    const notHelpful = this.notHelpful;

    for (let i = 0; i < notHelpful.length; i++) {
        if (notHelpful[i].accountId === accountId) {
            return true;
        }
    }
    return false;
});

const ProductReviewModel = model<StoreProductReview, ProductReviewModelStatics>('productreviews', ProductReviewSchema);
export default ProductReviewModel;