import { Types } from "mongoose";

type ObjectIdOrString = Types.ObjectId | string;

// wallet
export interface AccountWallet {
    _id?: ObjectIdOrString
    accountId: ObjectIdOrString
    amount?: number
    // transactions?: Array<Transaction>
    createdAt?: Date
}

export interface WalletTransaction {
    walletId: Types.ObjectId | string,
    accountId: Types.ObjectId | string,
    amount: number, 
}


// transaction
export interface AccountTransaction {
    _id?: ObjectIdOrString
    accountId: ObjectIdOrString
    walletId?: ObjectIdOrString
    recieverWalletId?: ObjectIdOrString
    amount: number
    timeStamp: string
    reason: string
    createdAt?: Date
}

interface TransactionTypes {
    deposit: string
    withdraw: string
    makeTransfer: string
    recieveTransfer: string
    makePayment: string
}

export const transactionTypes: TransactionTypes = {
    deposit: "deposit",
    withdraw: "withdraw",
    makeTransfer: "makeTransfer",
    recieveTransfer: "recieveTransfer",
    makePayment: "makePayment"
}