import { Schema, model, Types, Model, HydratedDocument, } from 'mongoose';
import { AccountTransaction } from '../../../../transaction/types/index.js';

interface Response {
    status: number
    success: boolean
    error: boolean 
    data?: unknown
}

interface TransactionMethods {
    getInfo(): () => void; 
}

interface TransactionModelStatics extends Model<AccountTransaction, object, TransactionMethods> {
    createTransaction(transaction: AccountTransaction): Promise<HydratedDocument<AccountTransaction, TransactionMethods>>;
    getAll(): Promise<Array<HydratedDocument<AccountTransaction, TransactionMethods>>>;
    getTransaction(id: Types.ObjectId | string): Promise<HydratedDocument<AccountTransaction, TransactionMethods>>;
    getAllAccount(accountId: Types.ObjectId | string): Promise<Array<HydratedDocument<AccountTransaction, TransactionMethods>>>;
    removeTransaction(accountId: Types.ObjectId | string, transactionId: Types.ObjectId | string): Promise<Response>;
}

const TransactionSchema = new Schema<AccountTransaction, TransactionModelStatics, TransactionMethods>({
    accountId: { type: String, required: true },
    walletId: { type: String, required: true },
    recieverWalletId: { type: String, required: true },
    amount: { type: Number, required: true },
    timeStamp: { type: String, required: true },
    reason: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

TransactionSchema.static('createTransaction', async function createTransaction(
    transaction: AccountTransaction,
): Promise<HydratedDocument<AccountTransaction, TransactionMethods>> {
    return await this.create({ 
        accountId: transaction.accountId,
        walletId: transaction.walletId,
        amount: transaction.amount,
        recieverWalletId: transaction.recieverWalletId || null,
        // type: transaction.type,
        timeStamp: transaction.timeStamp,
        reason: transaction.reason,
    });
});

TransactionSchema.static('getAll', async function getAll(

): Promise<Array<HydratedDocument<AccountTransaction, TransactionMethods>>> {
    return await this.find(); 
});


TransactionSchema.static('getTransaction', async function getTransaction(
    id: Types.ObjectId | string
): Promise<HydratedDocument<AccountTransaction, TransactionMethods>> {
    return await this.findOne({_id: id});
});

TransactionSchema.static('getAllAccount', async function getAllAccount(
    accountId: Types.ObjectId | string
): Promise<Array<HydratedDocument<AccountTransaction, TransactionMethods>>> {
    const wallet = await this.find({ 
        $or: [{vendorId: accountId}, {accountId: accountId}]
    });
    return wallet;
});

TransactionSchema.static('removeAccountTransaction', async function removeAccountTransaction(
    accountId: Types.ObjectId | string,
    transactionId: Types.ObjectId | string 
): Promise<Response> {
    const response = await this.deleteOne({
        $and: [{_id: transactionId}, {accountId: accountId}]
    });
    return ({status: 200, error: false, success: true, data: response});
});

const TransactionModel = model<AccountTransaction, TransactionModelStatics>('accounttransaction', TransactionSchema);
export default TransactionModel;