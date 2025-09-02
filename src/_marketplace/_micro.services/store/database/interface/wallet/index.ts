import { Types } from 'mongoose';
import { StoreWallet } from '../../../types/index.js';
import StoreWalletModel from '../../models/wallet/index.js';


const storeWalletDbInterface = {
    async createWallet(
        vendorId: Types.ObjectId | string, 
        storeId: Types.ObjectId | string,
    ) { 
        const wallet: StoreWallet = {
            vendorId: vendorId,
            storeId: storeId,
            amount: 0.00
        } 

        return await StoreWalletModel.createWallet(wallet);
    },

    async debitWallet(
        walletId: Types.ObjectId | string, 
        amount: number
    ) {
        try {
            const response = await StoreWalletModel.debit(walletId, amount);
            return response;
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },

    async creditWallet(
        walletId: Types.ObjectId | string,
        // depositUserId: Types.ObjectId | string, 
        amount: number
    ) { 
        try {
            const response = await StoreWalletModel.credit(walletId, amount);
            return response;
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },

    async getAllWallets() {
        try {
            const wallets = await StoreWalletModel.getAll();
            return wallets;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getWallet(walletId: Types.ObjectId | string) {
        try {
            const wallet = await StoreWalletModel.get(walletId);
            return wallet;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async storeWalletExist(id: Types.ObjectId | string) {
        try {
            const wallet = await StoreWalletModel.get(id);
            return wallet ? true : false;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}

export default storeWalletDbInterface;