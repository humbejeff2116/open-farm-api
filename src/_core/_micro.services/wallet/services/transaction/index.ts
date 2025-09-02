import { Types } from "mongoose";
import accountTransactionDbInterface from "../../database/interface/transaction/index.js";
import type { AccountTransaction } from "../../types/index.js";

const transactionService = { 
    async createTransaction(transaction: AccountTransaction) {
        const transactionRes = await accountTransactionDbInterface.createTransaction(transaction);
        return ({
            success: true,
            error: false,
            status: 200,
            message: 'transaction created successfully',
            data: transactionRes,
        })
    },

    async removeTransaction(
        accountId: Types.ObjectId | string,
        transactionId: Types.ObjectId | string
    ) {
        try {
            const response = await accountTransactionDbInterface.removeTransaction(
                accountId,
                transactionId
            );
            return ({       
                ...response,
                message: 'transaction removed successfully',
            });
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getAllTransactions() {
        try {
            const response = await accountTransactionDbInterface.getAllTransactions();
            return response;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getTransaction(transactionId: Types.ObjectId | string) {
        try {
            const response = await accountTransactionDbInterface.getTransaction(transactionId);
            return response;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getTransactions(accountId: Types.ObjectId | string) {
        try {
            const response = await accountTransactionDbInterface.getAllAccountTransactions(accountId);
            return response;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}

export default transactionService;