import { Schema, model, Types, Model, HydratedDocument, } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Account } from '../../types/index.js';

interface Response {
    status: number,
    error: boolean, 
    data: unknown
}

interface AccountMethods {
    checkPassword(): (err: Error, isMatch: boolean) => void; 
}

interface AccountModelStatics extends Model<Account, object, AccountMethods> {
    createAccount(account: Account): Promise<HydratedDocument<Account, AccountMethods>>;
    getAll(): Promise<Array<HydratedDocument<Account, AccountMethods>>>;
    getByEmail(email: string): Promise<HydratedDocument<Account, AccountMethods>>;
    getById(id: Types.ObjectId | string): Promise<HydratedDocument<Account, AccountMethods>>;
    updateProfileImage(id: Types.ObjectId | string, profileImage: string): Promise<Response>;
    getPurchaseHistory(accountId: Types.ObjectId | string): Promise<HydratedDocument<Account, AccountMethods>>;
    updateNotificationStatus(accountId: Types.ObjectId | string, hasActiveNotification: boolean): Promise<Response>;
}

const AccountSchema = new Schema<Account, AccountModelStatics, AccountMethods>({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    userName: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contactNumber: { type: String },
    profileImage: { type: String },
    role: {
        type: String,
        enum: ["admin", "vendor", "buyer", "guest", "anonymous"],
        required: true,
        index: true,
    },
    active: { type: Boolean, default: true },
    invalidLoginAttempts: { type: Number, default: 0 },
    lockLogin: { type: Date, default: null },
    passwordResetReq: { type: Number, default: 0 },
    lockResetPassword: { type: Date, default: null },
    purchaseHistory: [{}],
    hasActiveNotification: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
})

AccountSchema.pre('save', async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    this.password = await hashPassword(this.password);
})

async function hashPassword(password: string): Promise<string> {
    return new Promise((res, rej) => {
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
               return rej(err);
            }
    
            bcrypt.hash(password, salt, (err, hashedpassword) => {
                if (err) {
                    return rej(err);
                }
                res(hashedpassword);
            })
        })
    })
}

AccountSchema.method('checkPassword', function checkPassword(
    guess: string, 
    done: (err: Error, isMatch: boolean) => void
): void {
    bcrypt.compare(guess, this.password, function(err, isMatch) {
        done(err, isMatch);
    });
});

// AccountSchema.method('getNotifications', function getNotifications(): Array<Notification> {
//     return this.notifications;
// });

AccountSchema.static('createAccount', async function createAccount(
    account: Account
): Promise<HydratedDocument<Account, AccountMethods>> {
    console.log("account in model", account);

    return await this.create({ 
        fullName: account.fullName,
        email: account.email,
        userName: account.email,
        password: account.password,
    });
});

AccountSchema.static('getAll', async function getAll(

): Promise<Array<HydratedDocument<Account, AccountMethods>>> {
    const accounts = await this.find({}, {
        password: 0
    });
    return accounts;
});

AccountSchema.static('getByEmail', async function getByEmail(
    email: string
): Promise<HydratedDocument<Account, AccountMethods>> {
    const account = await this.findOne({ email });
    return account;
});

AccountSchema.static('getById', async function getById(
    id: Types.ObjectId | string
): Promise<HydratedDocument<Account, AccountMethods>> {
    const account = await this.findOne({ _id: id }, {
        password: 0
    });
    return account;
});

AccountSchema.static('getPurchaseHistory', async function getPurchaseHistory(
    id: Types.ObjectId | string
): Promise<Response> {
    const account = await this.findOne({ _id: id }, {
        password: 0
    });
    return ({status: 201, error: false, data: account.purchaseHistory});
});

AccountSchema.static('updateProfileImage', async function updateProfileImage(
    id: Types.ObjectId | string, 
    profileImage: string
): Promise<Response> {
    await this.updateOne({ _id: id }, { "$set": {"profileImage": profileImage} });

    const account = await this.findOne({ _id: id }, {
        password: 0,
        createdAt: 0
    });
    return ({status: 201, error: false, data: account});
});

AccountSchema.static('updateNotificationStatus', async function updateNotificationStatus(
    accountId: Types.ObjectId | string, 
    hasActiveNotification: boolean
): Promise<Response> {
    const updateResponse = await this.updateOne(
        { _id: accountId }, 
        { "$set": {"hasActiveNotification": hasActiveNotification} }
    );

    return ({status: 201, error: false, data: updateResponse});
});

const AccountModel = model<Account, AccountModelStatics>('account', AccountSchema);
export default AccountModel;