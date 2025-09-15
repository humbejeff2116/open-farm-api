import { Types } from "mongoose";
import accountSessionService from "./account-session/index.js";
import type { Account } from "../types/index.js";
import accountDbInterface from "../database/interface/index.js";


const accountService = {
    session: accountSessionService,
    async signUp(account: Account) { 


        return await supabase.auth.signUp({
            email: account.email,
            password: account.password,
            options: {
                data: {
                    invite_code: account.inviteCode,
                    full_name: account.fullName,
                    team_name: account?.teamName
                }
            }
        })
        

        // try {
        //     const accountRes = await accountDbInterface.createAccount(account);
        //     return ({
        //         success: true,
        //         error: false,
        //         status: 200,
        //         message: 'Account created successfully',
        //         data: accountRes,
        //     })
        // } catch (err) {
        //     console.error(err);
        //     throw err;
        // }
    },

    async getAccounts() {
        try {
            const users = await accountDbInterface.getAllAccounts();
            return users;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getAccountByEmail(accountEmail: string) {
        try {
            const account = await accountDbInterface.getAccountByEmail(accountEmail);
            return account;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getAccountById(accountId: Types.ObjectId | string) {
        try {
            const account = await accountDbInterface.getAccountById(accountId);
            return account;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async updateAccountProfileImage(
        accountId: Types.ObjectId | string, 
        profileImage
    ) {
        try {
            const accountResponse = await accountDbInterface.updateAccountProfileImage(accountId, profileImage);
            return ({
                ...accountResponse,
                message: 'Account profile image updated',
            })
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async updateAccountNotificationStatus(
        accountId: Types.ObjectId | string, 
        hasActiveNotification: boolean
    ) {
        try {
            if (await accountDbInterface.accountHasActiveNotification(accountId)) {
                return ({status: 201, error: false, message: "active notification already exist", data: null});
            }

            const accountResponse = await accountDbInterface.updateAccountNotificationStatus(accountId, hasActiveNotification);
            return ({
                ...accountResponse,
                message: 'Notification status updated',
            })
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getAccountPurchaseHistory(accountId: Types.ObjectId | string) {
        try {
            const accountResponse = await accountDbInterface.getAccountPurchaseHistory(accountId);
            return accountResponse;
        } catch (err) {
            console.error(err);
            throw err;
        }
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
    },

    async AccountExist(id: string): Promise<boolean> {
        return await this.getAccountById(id) ? true : false;
    },
}

export default accountService;