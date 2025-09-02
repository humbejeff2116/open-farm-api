import { Types } from "mongoose";
import type { Transaction } from "../types/index.js";
import transactionDbInterface from "../database/interface/index.js";
import accountService from "../../account/services/index.js";
import storeService from "../../../../_marketplace/_micro.services/store/services/index.js";
import walletService from "../../wallet/services/wallet/index.js";


const transactionService = {  
    async _persistTransaction(transaction: Transaction) {
        const transactionRes = await transactionDbInterface.createTransaction(transaction);
        return transactionRes;
    },

    async payForOrder(transaction: Transaction) {
        try {
            const debitBuyer = await walletService.debitWallet(
                transaction.buyerId,
                transaction.amount
            )

            if (debitBuyer.success) {
                const creditStore = await storeService.creditStoreWallet(
                    transaction.storeId, 
                    transaction.amount
                );
    
                if (creditStore.success) {
                    const transactionRes = await this._persistTransaction(transaction);
    
                    return ({       
                        ...creditStore,
                        message: 'pay for order successful',
                        data: transactionRes
                    });
                }
    
                return creditStore;
            } else {
                return debitBuyer;
            }
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async refundBuyer(
        // transaction: WalletTransaction, 
        transaction: Transaction
    ) {
        try {
            const transactionRes = await transactionService.getTransaction(transaction._id);

            if (!transactionRes) {
                return ({
                    error: false,
                    success: false,
                    status: 400,
                    message: 'Transaction not found',
                    data: null
                })
            }
            
            // TODO... refactor 
            // communicate with account or wallet service using message queue
            // send a refund message to wallet 
            // this operation is performed at wallet service
            const buyerWallet = await walletService.getAccountWallet(
                transaction.buyerId
            )

            if (!buyerWallet) {
                return ({
                    error: false,
                    success: false,
                    status: 400,
                    message: 'Buyer wallet not found',
                    data: null
                })
            }

            // TODO... refactor
            // app is now using a single account wallet -> (wallet service)
            // 
            const debitStore = await storeService.debitStoreWallet(
                transaction.storeId,
                transaction.amount
            )

            if (debitStore.success) {
                const creditBuyer = await walletService.creditWallet(
                    buyerWallet._id,
                    transaction.amount
                );
    
                if (creditBuyer.success) {
                    const transactionRes = await this._persistTransaction(
                        transaction
                    );
                    
                    return ({       
                        ...creditBuyer,
                        message: 'refund buyer successful',
                        data: transactionRes
                    });
                } else {
                    return creditBuyer;
                }
            } else {
                return debitStore;
            }
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getTransaction(transactionId: Types.ObjectId | string) {
        try {
            const transactionRes = await transactionDbInterface.getTransaction(transactionId);
            return transactionRes;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getAccountTransactions(accountId: Types.ObjectId | string) {
        try {
            const transactionsRes = await transactionDbInterface.getAccountTransactions(accountId);
            return transactionsRes;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getAllStoreTransactions(storeId: Types.ObjectId | string) {
        try {
            const transactionsRes = await transactionDbInterface.getAllStoreTransactions(storeId);
            return transactionsRes;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getAllTransactions() {
        try {
            const transactionRes = await transactionDbInterface.getAllTransactions();
            return transactionRes;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}

export default transactionService;