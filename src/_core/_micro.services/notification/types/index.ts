import { Types } from "mongoose"

type ObjectIdOrString = Types.ObjectId | string;

// notifications for buyer
export interface AccountNotification {
    _id?: Types.ObjectId
    accountId: ObjectIdOrString 
    title: string
    message: string
    createdAt?: Date,
}