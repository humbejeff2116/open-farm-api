import { Types } from "mongoose";
import walletDbInterface from "../../database/interface/wallet/index.js";


const walletService = { 
    async createWallet(accountId: Types.ObjectId | string) {
        const response = await walletDbInterface.createWallet(accountId);
        return response;
    },

    async debitWallet(
        walletOrAccountId: Types.ObjectId | string,
        amount: number
    ) {
        try {
            if (!await walletDbInterface.walletExist(walletOrAccountId)) {
                return ({
                    success: false,
                    error: false,
                    status: 400,
                    message: 'account wallet does not exist'
                })
            } 
            const response = await walletDbInterface.debitWallet(walletOrAccountId, amount);
            return ({
                ...response,
                message: 'debit account wallet successful',
            })
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
            if (!await walletDbInterface.walletExist(walletOrAccountId)) {
                return ({
                    success: false,
                    error: false,
                    status: 400,
                    message: 'account wallet does not exist'
                })
            } 
            const response = await walletDbInterface.creditWallet(walletOrAccountId, amount);
            return ({
                ...response,
                message: 'credit account wallet successful',
            })
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },

    async transferWallet(
        senderWalleOrAccounttId: Types.ObjectId | string,
        recieverWalletOrAccountId: Types.ObjectId | string,
        amount: number
    ) {
        try {
            const [senderWallet, recieverWallet] = await Promise.all([
                walletDbInterface.getWallet(senderWalleOrAccounttId),
                walletDbInterface.getWallet(recieverWalletOrAccountId)
            ]);

            if (!senderWallet) {
                return({
                    success: false,
                    error: true,
                    status: 403,
                    message: "sender wallet not found",
                    data: null
                });
            }

            if (!recieverWallet) {
                return({
                    success: false,
                    error: true,
                    status: 403,
                    message: "Reciever wallet not found",
                    data: null
                });
            }
 
            if (senderWallet.amount < amount) {
                return({
                    success: false,
                    error: true,
                    status: 403,
                    message: "insufficient funds",
                    data: null
                });
            }

            await walletDbInterface.debitWallet(
                senderWalleOrAccounttId, 
                amount
            );
            await walletDbInterface.creditWallet(
                recieverWalletOrAccountId, 
                amount
            );
            
            return({
                success: true,
                error: false,
                status: 201,
                message: "transfer funds successful",
                data: null
            });

        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getWallets() {
        try {
            const response = await walletDbInterface.getAllWallets();
            return response;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getAccountWallet(walletOrAccountId: Types.ObjectId | string) {
        try {
            const wallet = await walletDbInterface.getWallet(walletOrAccountId);
            return wallet;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}

export default walletService;