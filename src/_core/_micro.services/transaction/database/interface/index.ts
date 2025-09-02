import { Types } from 'mongoose';
import { Transaction } from '../../types/index.js';
import TransactionModel from '../models/index.js';

const transactionDbInterface = {
    async createTransaction(transaction: Transaction) { 
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

    async getAccountTransactions(accountId: Types.ObjectId | string) {
        try {
            const response = await TransactionModel.getAllAccount(accountId);
            return response;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getAllStoreTransactions(storeId: Types.ObjectId | string) {
        try {
            const response = await TransactionModel.getAllStore(storeId);
            return response;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async removeStoreTransaction(
        transactionId: Types.ObjectId | string, 
        storeId: Types.ObjectId | string
    ) {
        try {
            const response = await TransactionModel.removeStore(
                transactionId, 
                storeId
            );
            return response;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async removeAccountTransaction(
        transactionId: Types.ObjectId | string, 
        accountId: Types.ObjectId | string
    ) {
        try {
            const response = await TransactionModel.removeAccount(
                transactionId, 
                accountId
            );
            return response;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}

export default transactionDbInterface;