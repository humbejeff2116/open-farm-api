import { Types } from 'mongoose';
import TransactionModel from '../../models/transaction/index.js';
import { AccountTransaction } from '../../../types/index.js';


const transactionDbInterface = {
    async createTransaction(transaction: AccountTransaction) { 
        try {
            const transactionRes = await TransactionModel.createTransaction(transaction);
            return transactionRes;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getAllTransactions() {
        try {
            const response = await TransactionModel.getAll();
            return response;
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },

    async getTransaction(transactionId: Types.ObjectId | string) { 
        try {
            const response = await TransactionModel.getTransaction(transactionId);
            return response;
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },

    async getAllAccountTransactions(accountId: Types.ObjectId | string) {
        try {
            const response = await TransactionModel.getAllAccount(accountId);
            return response;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },
    
    async removeTransaction(
        accountId: Types.ObjectId | string,
        transactionId: Types.ObjectId | string
    ) {
        try {
            const response = await TransactionModel.removeAccountTransaction(
                accountId,
                transactionId
            );
            return response;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}

export default transactionDbInterface;