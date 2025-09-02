import { Types } from 'mongoose';
import { AccountNotification } from '../../types/index.js';
import NotificationModel from '../models/index.js';

const notificationDbInterface = {
    async createNotification(notification: AccountNotification) { 
        try {
            const notificationRes = await NotificationModel.createNotification(notification);
            return notificationRes;
        } catch (err) {
            console.error(err);
            throw err;
        } 
    },

    async getNotification(notificationId: Types.ObjectId | string) {
        try {
            const notification = await NotificationModel.get(notificationId);
            return notification;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getAccountNotifications(accountId: Types.ObjectId | string) {
        try {
            const notifications = await NotificationModel.getAllAccount(accountId);
            return notifications;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async removeAccountNotification(
        accountId: Types.ObjectId | string, 
        notificationId: Types.ObjectId | string
    ) {
        try {
            const removeResponse = await  NotificationModel.removeAccount(accountId, notificationId);
            return removeResponse;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }  
}

export default notificationDbInterface;