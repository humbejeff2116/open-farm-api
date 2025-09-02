import { Types } from "mongoose"

type ObjectIdOrString = Types.ObjectId | string;

// trade manager
export interface TradeManager {
    _id?: Types.ObjectId
    vendorId: ObjectIdOrString
    storeId: ObjectIdOrString
    orders?: Array<TradeManagerOrder>
    transactions?: Array<TradeManagerTransaction>
    createdAt?: Date,
}

export interface TradeManagerOrder {
    id: ObjectIdOrString
}
export interface TradeManagerTransaction {
    id: ObjectIdOrString
}

// transaction
export interface TradeTransaction {
    _id?: ObjectIdOrString
    buyerId: ObjectIdOrString
    storeId: ObjectIdOrString
    orderId: ObjectIdOrString
    amount: number
    timeStamp: string
    reason: string
    createdAt?: Date
}

// order
export interface TradeOrder {
    _id?: Types.ObjectId,
    timestamp: string
    storeId: ObjectIdOrString
    buyerId: ObjectIdOrString
    totalAmount: number
    delivered: boolean
    products: Array<TradeOrderProduct>
    createdAt?: Date
}

export interface TradeOrderProduct {
    productId: ObjectIdOrString
    quantity: number
    price: number
    discount: number
}

// notifications for buyer
export interface TradeNotification {
    _id?: Types.ObjectId
    accountId: ObjectIdOrString 
    title: string
    message: string
    createdAt?: Date,
}