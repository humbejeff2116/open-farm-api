import { Schema, model, Types, Model, HydratedDocument, } from 'mongoose';
import { AccountNotification } from '../../types/index.js';

interface Response {
    status: number
    error: boolean 
    data: unknown
}

interface NotificationMethods {
    getMessage(): string; 
}

interface NotificationModelStatics extends Model<AccountNotification, object, NotificationMethods> {
    createNotification(notification: AccountNotification): Promise<HydratedDocument<AccountNotification, NotificationMethods>>;
    get(id: Types.ObjectId | string): Promise<HydratedDocument<AccountNotification, NotificationMethods>>;
    getAllAccount(accountId: Types.ObjectId | string): Promise<HydratedDocument<AccountNotification, NotificationMethods>>;
    removeAccount(accountId: Types.ObjectId | string, notificationId: Types.ObjectId | string): Promise<Response>; 
}

const NotificationsSchema = new Schema<AccountNotification, NotificationModelStatics, NotificationMethods>({
    accountId: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
})

NotificationsSchema.static('createNotification', async function createNotification(
    notification: AccountNotification
): Promise<HydratedDocument<AccountNotification, NotificationMethods>> {
    console.log("notification in model", notification);

    return await this.create({ 
        accountId: notification.accountId,
        title: notification.title,
        message: notification.message,
    });
});

NotificationsSchema.static('get', async function get(
    id: Types.ObjectId | string
): Promise<HydratedDocument<AccountNotification, NotificationMethods>> {
    const notification = await this.findOne({ _id: id });
    return notification;
});

NotificationsSchema.static('getAllAccount', async function getAllAccount(
    accountId: Types.ObjectId | string
): Promise<Array<HydratedDocument<AccountNotification, NotificationMethods>>> {
    const notifications = await this.find({ accountId: accountId });
    return notifications;
});

NotificationsSchema.static('removeAccount', async function removeAccount(
    accountId: Types.ObjectId | string, 
    notificationId: Types.ObjectId | string
): Promise<Response> {
    const removeNotification = await this.updateOne({ 
        $and: [{accountId: accountId}, { _id: notificationId }] 
    });
    return ({ status: 201, error: false, data: removeNotification })
});


const NotificationModel = model<AccountNotification, NotificationModelStatics>('AccountNotification', NotificationsSchema);
export default NotificationModel;