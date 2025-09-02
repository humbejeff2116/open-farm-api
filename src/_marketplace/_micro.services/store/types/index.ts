import { Types } from "mongoose";

type ObjectIdOrString = Types.ObjectId | string;

export const storeTypes = {
    basic: 'basic',
    standard: 'standard',
    premium: 'premium'
}

// store
export interface Store {
    _id?: Types.ObjectId
    vendorId: ObjectIdOrString,
    storeType: string 
    collections?: Array<StoreCollection1>
    tradeManager?: StoreTradeManager
    createdAt?: Date,
}

export interface StoreCollection1 {
    id: ObjectIdOrString
}

export interface StoreTradeManager {
    id: ObjectIdOrString
}

// collection
export interface StoreCollection {
    _id?: Types.ObjectId
    vendorId: ObjectIdOrString
    storeId: ObjectIdOrString
    name: string
    products?: Array<StoreCollectionProduct>
    createdAt?: Date 
} 

export interface StoreCollectionProduct {
    id: ObjectIdOrString
}

// product
export interface StoreProduct {
    _id?: Types.ObjectId
    vendorId: ObjectIdOrString 
    storeId: ObjectIdOrString
    collectionId: ObjectIdOrString
    name: string
    description: string
    price: number
    numSold: number
    discount: number
    category: string
    likesCount?: number 
    likes?: Array<StoreProductLike>
    createdAt?: Date
}

export interface StoreProductLike {
    like: boolean
    timestamp: Date | string
    accountId: ObjectIdOrString
}

// product review
export interface StoreProductReview {
    _id?: Types.ObjectId
    buyerId: ObjectIdOrString
    vendorId: ObjectIdOrString
    productId: ObjectIdOrString
    starRating?: number
    review: string
    timestamp: string | Date
    helpful?: Array<StoreProductReviewer>
    notHelpful?: Array<StoreProductReviewer>
    createdAt?: Date
}

export interface StoreProductReviewer {
    accountId: ObjectIdOrString
}

// wallet
export interface StoreWallet {
    _id?: ObjectIdOrString
    vendorId: ObjectIdOrString
    storeId: ObjectIdOrString 
    amount?: number
    createdAt?: Date
}