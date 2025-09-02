import { Types } from "mongoose"

type ObjectIdOrString = Types.ObjectId | string;



// transaction
export interface Transaction {
    _id?: ObjectIdOrString
    buyerId: ObjectIdOrString
    storeId: ObjectIdOrString
    orderId: ObjectIdOrString
    amount: number
    timeStamp: string
    reason: string
    createdAt?: Date
}