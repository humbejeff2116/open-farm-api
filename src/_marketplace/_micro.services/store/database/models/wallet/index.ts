import { Schema, model, Types, Model, HydratedDocument, } from 'mongoose';
import { StoreWallet } from '../../../types/index.js';

type ObjectIdOrString = Types.ObjectId | string;

interface Response {
    status: number
    success: boolean
    error: boolean 
    data?: unknown
}

interface StoreWalletMethods {
    getInfo(): () => void; 
}

interface StoreWalletModelStatics extends Model<StoreWallet, object, StoreWalletMethods> {
    createWallet(wallet: StoreWallet): Promise<HydratedDocument<StoreWallet, StoreWalletMethods>>;
    credit(id: ObjectIdOrString, amount: number): Promise<Response>;
    debit(id: ObjectIdOrString, amount: number): Promise<Response>;
    getAll(): Promise<Array<HydratedDocument<StoreWallet, StoreWalletMethods>>>;
    get(id: ObjectIdOrString): Promise<HydratedDocument<StoreWallet, StoreWalletMethods>>;
    getVendorWallet(vendorId: ObjectIdOrString): Promise<HydratedDocument<StoreWallet, StoreWalletMethods>>;
}

const WalletSchema = new Schema<StoreWallet, StoreWalletModelStatics, StoreWalletMethods>({
    vendorId: { type: String, required: true },
    storeId: { type: String, required: true }, 
    amount: { type: Number, default: 0.00 },
    createdAt: { type: Date, default: Date.now },
})


WalletSchema.static('createWallet', async function createWallet(
    wallet: StoreWallet
): Promise<HydratedDocument<StoreWallet, StoreWalletMethods>> {
    return await this.create({ 
        vendorId: wallet.vendorId,
        storeId: wallet.storeId, 
        amount: wallet.amount
    });
});

// TODO... crosscheck $inc method
WalletSchema.static('credit', async function credit(
    id: ObjectIdOrString, 
    amount: number
): Promise<Response> {
    const update = await this.findOneAndUpdate(
        { $or: [{_id: id}, {storeId: id}] }, 
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
        { $or: [{_id: id}, {storeId: id}] },
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

): Promise<Array<HydratedDocument<StoreWallet, StoreWalletMethods>>> {
    const wallets = await this.find({});
    return wallets;
});

WalletSchema.static('get', async function get(
    id: ObjectIdOrString
): Promise<HydratedDocument<StoreWallet, StoreWalletMethods>> {
    const wallet = await this.findOne(
        {$or: [{_id: id}, {vendorId: id}, {storeId: id}]}
    );
    return wallet;
});

const StoreWalletModel = model<StoreWallet, StoreWalletModelStatics>('storewallet', WalletSchema);
export default StoreWalletModel;