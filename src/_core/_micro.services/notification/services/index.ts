import { Types } from "mongoose";
import notificationDbInterface from "../database/interface/index.js";
import type { AccountNotification } from "../types/index.js";

const notificationService = {
    async createNotification(notification: AccountNotification) { 
        try {
            const notificationRes = await notificationDbInterface.createNotification(notification);
            return ({
                success: true,
                error: false,
                status: 200,
                message: 'Create trade notification succesful',
                data: notificationRes,
            })
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },

    async getNotification(notificationId: Types.ObjectId | string) {
        try {
            const notification = await notificationDbInterface.getNotification(notificationId);
            return notification;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getAccountNotifications(accountId: Types.ObjectId | string) {
        try {
            const notifications = await notificationDbInterface.getAccountNotifications(accountId);
            return notifications;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async removeNotification(
        accountId: Types.ObjectId | string, 
        notificationId: Types.ObjectId | string
    ) {
        try {
            if (!await this.getNotification(notificationId)) {
                return ({
                    success: false,
                    error: false,
                    status: 400,
                    message: 'Notification does not exist',
                    data: null,
                })
            }
            const removeResponse = await notificationDbInterface.removeAccountNotification(accountId, notificationId);
            return ({
                ...removeResponse,
                message: ' Notification removed successfully',
            })
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}

export default notificationService;