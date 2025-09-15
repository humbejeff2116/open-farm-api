import { Types } from 'mongoose';
import { Account } from '../../types/index.js';
import AccountModel from '../models/index.js';

const accountDbInterface = {
    async createAccount(account: Account) { 
        try {
            const accountRes = await AccountModel.createAccount(account);
            return accountRes;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getAllAccounts() {
        try {
            const accountsRes = await AccountModel.getAll();
            return accountsRes;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getAccountByEmail(accountEmail: string) {
        try {
            const account = await AccountModel.getByEmail(accountEmail);
            return account;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getAccountById(accountId: Types.ObjectId | string) {
        try {
            const account = await AccountModel.getById(accountId);
            return account;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async updateAccountProfileImage(accountId: Types.ObjectId | string, profileImage) {
        try {
            const updateRes = await AccountModel.updateProfileImage(accountId, profileImage);
            return updateRes;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async updateAccountNotificationStatus(accountId: Types.ObjectId | string, hasActiveNotification: boolean) {
        try {
            const update = await AccountModel.updateNotificationStatus(accountId, hasActiveNotification);
            return update;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async accountHasActiveNotification(accountId: Types.ObjectId | string) {
        try {
            const account= await this.getById(accountId);
            
            if (account&& account.hasActiveNotification) {
                return true;
            }
            return false;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getAccountPurchaseHistory(accountId: Types.ObjectId | string) {
        const accountRes = await AccountModel.getPurchaseHistory(accountId);
        return accountRes;
    },

    async checkAccountPassword(password: string, account): Promise<{error: boolean, match: boolean}> {
        return new Promise((res, rej) => {
            account.checkPassword(password, function (err: Error, isMatch: boolean) {
                if (err) {
                    rej(err);
                }
                if (!isMatch) {
                    res({error: false, match: false });
                }
                res({error: false, match: true });
            })
        })
    }
}

export default accountDbInterface;