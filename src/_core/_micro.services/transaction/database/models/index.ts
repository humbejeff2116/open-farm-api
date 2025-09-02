import { Schema, model, Types, Model, HydratedDocument, } from 'mongoose';
import { Transaction } from '../../types/index.js';

interface Response {
    status: number
    success: boolean
    error: boolean 
    data?: unknown
}


interface TransactionMethods {
    getInfo(): () => void; 
}

interface TransactionModelStatics extends Model<Transaction, object, TransactionMethods> {
    createTransaction(transaction: Transaction): Promise<HydratedDocument<Transaction, TransactionMethods>>;
    getAll(): Promise<Array<HydratedDocument<Transaction, TransactionMethods>>>;
    getTransaction(id: Types.ObjectId | string): Promise<HydratedDocument<Transaction, TransactionMethods>>;
    getAllStore(storeId: Types.ObjectId | string): Promise<Array<HydratedDocument<Transaction, TransactionMethods>>>;
    getAllAccount(accountId: Types.ObjectId | string): Promise<Array<HydratedDocument<Transaction, TransactionMethods>>>;
    removeStore(transactionId: Types.ObjectId | string, storeId: Types.ObjectId | string): Promise<Response>;
    removeAccount(transactionId: Types.ObjectId | string, accountId: Types.ObjectId | string): Promise<Response>;
}

const TransactionSchema = new Schema<Transaction, TransactionModelStatics, TransactionMethods>({
    buyerId: { type: String, required: true },
    storeId: { type: String, required: true },
    amount: { type: Number, required: true },
    // vendorId: { type: String, required: true },
    timeStamp: { type: String, required: true },
    reason: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

TransactionSchema.static('createTransaction', async function createTransaction(
    transaction: Transaction
): Promise<HydratedDocument<Transaction, TransactionMethods>> {
    return await this.create({ 
        buyerId: transaction.buyerId,
        storeId: transaction.storeId,
        amount: transaction.amount,
        orderId: transaction.orderId,
        // vendorId: transaction.vendorId,
        timeStamp: transaction.timeStamp,
        reason: transaction.reason,
    });
});

TransactionSchema.static('getAll', async function getAll(

): Promise<Array<HydratedDocument<Transaction, TransactionMethods>>> {
    return await this.find(); 
});

TransactionSchema.static('getTransaction', async function getTransaction(
    id: Types.ObjectId | string
): Promise<HydratedDocument<Transaction, TransactionMethods>> {
    return await this.findOne({_id: id});
});

TransactionSchema.static('getAllStore', async function getAllStore(
    storeId: Types.ObjectId | string
): Promise<Array<HydratedDocument<Transaction, TransactionMethods>>> {
    return await this.find({storeId: storeId});
});

TransactionSchema.static('getAllAccount', async function getAllAccount(
    accountId: Types.ObjectId | string
): Promise<Array<HydratedDocument<Transaction, TransactionMethods>>> {
    const wallet = await this.find({buyerId: accountId});
    return wallet;
});


TransactionSchema.static('removeStore', async function removeStore(
    transactionId: Types.ObjectId | string, 
    storeId: Types.ObjectId | string
): Promise<Response> {
    const response = await this.deleteOne({
        $and: [
            {_id: transactionId},
            {store: storeId}
        ]
    });
    return ({status: 200, error: false, success: true, data: response});
});

TransactionSchema.static('removeAccount', async function removeAccount(
    transactionId: Types.ObjectId | string, 
    accountId: Types.ObjectId | string
): Promise<Response> {
    const response = await this.deleteOne({
        $and: [
            {_id: transactionId},
            {buyerId: accountId}
        ]
    });
    return ({status: 200, error: false, success: true, data: response});
});

const TransactionModel = model<Transaction, TransactionModelStatics>('Transaction', TransactionSchema);
export default TransactionModel;