import { Types } from 'mongoose';
import WalletModel from '../../models/wallet/index.js';
import { AccountWallet } from '../../../types/index.js';
// import { walletsCacheInterface } from '../../../../cache/index.js';


const walletDbInterface = {
    async createWallet(accountId: Types.ObjectId | string) { 
        const wallet: AccountWallet = {
            accountId: accountId,
            amount: 0.00
        } 
        const response = await WalletModel.createWallet(wallet);
        return ({
            success: true,
            error: false,
            status: 200,
            data: response,
            message: 'wallet created successfully'
        });
    },

    async debitWallet(
        walletOrAccountId: Types.ObjectId | string,
        amount: number
    ) {
        try {
            const response = await WalletModel.debit(walletOrAccountId, amount);
            return response;
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },

    async creditWallet(
        walletOrAccountId: Types.ObjectId | string,
        amount: number
    ) { 
        try {
            const response = await WalletModel.credit(walletOrAccountId, amount);
            return response;
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },

    async getAllWallets() {
        try {
            const wallets = await WalletModel.getAll();
            return wallets;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getWallet(walletOrAccountId: Types.ObjectId | string) {
        try {
            const wallet = await WalletModel.get(walletOrAccountId);
            return wallet;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async walletExist(id: Types.ObjectId | string) {
        try {
            const wallet = await WalletModel.get(id);
            return wallet ? true : false;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}

export default walletDbInterface;