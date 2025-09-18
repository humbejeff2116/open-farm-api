

// wallet
export interface AccountWallet {
    id?: string
    accountId: string
    balance?: number
    // transactions?: Array<Transaction>
    createdAt?: Date
}

export interface WalletTransaction {
    walletId: string,
    accountId: string,
    balance: number, 
}


// transaction
export interface AccountTransaction {
    _d?: string
    accountId: string
    walletId?: string
    recieverWalletId?: string
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