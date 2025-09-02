import { Types } from "mongoose";
import { storeWalletDbInterface } from "../../database/interface/index.js";

const storeWalletService = {
    async createStoreWallet(
        vendorId: Types.ObjectId | string, 
        storeId: Types.ObjectId | string
    ) {
        const response = await storeWalletDbInterface.createWallet(vendorId, storeId);
        return ({
            success: true,
            error: false,
            status: 200,
            message: 'Store wallet created succesfully',
            data: response,
        })
    },

    async creditStoreWallet(
        walletId: Types.ObjectId | string, 
        amount: number
    ) {
        try {
            if (!await storeWalletDbInterface.storeWalletExist(walletId)) {
                return ({
                    success: false,
                    error: false,
                    status: 400,
                    message: 'store wallet does not exist'
                })
            } 
            const response = await  storeWalletDbInterface.creditWallet(walletId, amount);
            return ({
                ...response,
                message: 'store wallet credited successfully',
            })
        } catch (err) {
            console.error(err);
            throw err;
        }
    },
    
    async debitStoreWallet(
        walletId: Types.ObjectId | string, 
        amount: number
    ) {
        try {
            if (!await storeWalletDbInterface.storeWalletExist(walletId)) {
                return ({
                    success: false,
                    error: false,
                    status: 400,
                    message: 'store wallet does not exist'
                })
            } 
            const response = await storeWalletDbInterface.debitWallet(walletId, amount);
            return ({
                ...response,
                message: 'Store wallet debited successfully',
            });
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}

export default storeWalletService;