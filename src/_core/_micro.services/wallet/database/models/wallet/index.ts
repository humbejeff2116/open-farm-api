import { 
    Schema, 
    model, 
    Types, 
    Model, 
    HydratedDocument 
} from 'mongoose';
import { AccountWallet } from '../../../types/index.js';

type ObjectIdOrString = Types.ObjectId | string;

interface Response {
    status: number
    success: boolean
    error: boolean 
    data?: unknown
}

interface WalletMethods {
    getInfo(): () => void; 
}

interface WalletModelStatics extends Model<AccountWallet, object, WalletMethods> {
    createWallet(wallet: AccountWallet): Promise<HydratedDocument<AccountWallet, WalletMethods>>;
    credit(id: ObjectIdOrString, amount: number): Promise<Response>;
    debit(id: ObjectIdOrString, amount: number): Promise<Response>;
    getAll(): Promise<Array<HydratedDocument<AccountWallet, WalletMethods>>>;
    get(id: ObjectIdOrString): Promise<HydratedDocument<AccountWallet, WalletMethods>>;
}

const WalletSchema = new Schema<AccountWallet, WalletModelStatics, WalletMethods>({
    accountId: { type: String, required: true },
    amount: { type: Number, default: 0.00 },
    // transactions: [{}],
    createdAt: { type: Date, default: Date.now },
})


WalletSchema.static('createWallet', async function createWallet(
    wallet: AccountWallet
): Promise<HydratedDocument<AccountWallet, WalletMethods>> {
    return await this.create({ 
        accountId: wallet.accountId,
        amount: wallet.amount
    });
});

// TODO... crosscheck $inc method
WalletSchema.static('credit', async function credit(
    id: ObjectIdOrString, 
    amount: number
): Promise<Response> {
    const update = await this.findOneAndUpdate(
        { $or: [{_id: id}, {accountId: id}] }, 
        {$inc: {amount: amount}}
    );
    return ({
        status: 200,
        error: false,
        success: true,
        data: update
    }); 
});

WalletSchema.static('debit', async function debit(
    id: ObjectIdOrString, 
    amount: number
): Promise<Response> {
    const update = await this.findOneAndUpdate(
        { $or: [{_id: id}, {accountId: id}] }, 
        {$inc: {amount: -amount}}
    );
    return ({
        status: 200,
        error: false,
        success: true,
        data: update
    }); 
});

WalletSchema.static('getAll', async function getAll(

): Promise<Array<HydratedDocument<AccountWallet, WalletMethods>>> {
    const wallets = await this.find({});
    return wallets;
});

WalletSchema.static('get', async function get(
    id: ObjectIdOrString
): Promise<HydratedDocument<AccountWallet, WalletMethods>> {
    const wallet = await this.findOne({$or: [{_id: id}, {accountId: id}]});
    return wallet;
});


const WalletModel = model<AccountWallet, WalletModelStatics>('wallet', WalletSchema);
export default WalletModel;