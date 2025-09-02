import { Schema, model, Types, Model, HydratedDocument, } from 'mongoose';
import { Store, StoreCollection1, StoreTradeManager } from '../../types/index.js';
// import { TradeManager } from '../../../types/tradeManager.js';

interface Response {
    status: number,
    error: boolean, 
    data: unknown
}

interface StoreMethods {
    getStoreType(): (err: Error, isMatch: boolean) => void; 
}

interface StoreModelStatics extends Model<Store, object, StoreMethods> {
    createStore(store: Store): Promise<HydratedDocument<Store, StoreMethods>>;
    getAll(): Promise<Array<HydratedDocument<Store, StoreMethods>>>;
    getById(id: Types.ObjectId | string): Promise<HydratedDocument<Store, StoreMethods>>;
    getVendor(vendorId: Types.ObjectId | string): Promise<Array<HydratedDocument<Store, StoreMethods>>>;
    updateType(id: Types.ObjectId | string, type: string): Promise<Response>;
    addCollection(id: Types.ObjectId | string, collection: StoreCollection1): Promise<Response>;
    setTradeManager(id: Types.ObjectId | string, tradeManager: StoreTradeManager): Promise<Response>;
    updateCollectionAndTradeManager(
        id: Types.ObjectId | string, 
        collection: StoreCollection1, 
        tradeManager: StoreTradeManager
    ): Promise<Response>
}

const StoreSchema = new Schema<Store, StoreModelStatics, StoreMethods>({
    vendorId: {type: String },
    storeType: {type: String },
    collections: [{}],
    tradeManager: { type: Object },
    createdAt: { type: Date, default: Date.now },
})

StoreSchema.static('createStore', async function createStore(
    store: Store
): Promise<HydratedDocument<Store, StoreMethods>> {
    console.log("store in model", store);

    return await this.create({ 
        vendorId: store.vendorId,
        storeType: store.storeType,
        collections: [],
        // tradeManager: store.tradeManager
    });
});

StoreSchema.static('getAll', async function getAll(

): Promise<Array<HydratedDocument<Store, StoreMethods>>> {
    return await this.find({});
});

StoreSchema.static('getById', async function getById(
    id: Types.ObjectId | string
): Promise<HydratedDocument<Store, StoreMethods>> {
    return await this.findOne({ _id: id });
});

StoreSchema.static('getVendor', async function getVendor(
    vendorId: Types.ObjectId | string
): Promise<Array<HydratedDocument<Store, StoreMethods>>> {
    return await this.findOne({ vendorId: vendorId });
});

StoreSchema.static('updateType', async function updateType(
    id: Types.ObjectId | string, 
    type: string
): Promise<Response> {
    const res = await this.updateOne({ _id: id }, { "$set": {"storeType": type} });
    return ({status: 201, error: false, data: res});
});


StoreSchema.static('addCollection', async function addCollection(
    id: Types.ObjectId | string, 
    collection: StoreCollection1
): Promise<Response> {
    const response = await this.updateOne(
        { _id: id }, 
        { "$push": {"collections": collection} }
    );

    return ({status: 201, error: false, data: response});
});

StoreSchema.static('setTradeManager', async function setTradeManager(
    id: Types.ObjectId | string, 
    tradeManager: StoreTradeManager
): Promise<Response> {
    const response = await this.updateOne(
        { _id: id },{ "$set": {"tradeManager": tradeManager} });

    return ({status: 201, error: false, data: response});
});

StoreSchema.static('updateCollectionAndTradeManager', async function updateCollectionAndTradeManager(
    id: Types.ObjectId | string, 
    collection: StoreCollection1, 
    tradeManager: StoreTradeManager
): Promise<Response> {
    const response = await this.updateOne(
        { _id: id }, 
        { "$push": { "collections": collection } },
        { "$set": { "tradeManager": tradeManager } }
    );

    return ({status: 201, error: false, data: response});
});


const StoreModel = model<Store, StoreModelStatics>('store', StoreSchema);
export default StoreModel;