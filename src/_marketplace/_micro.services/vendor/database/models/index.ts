import { Schema, model, Types, Model, HydratedDocument } from 'mongoose';
import { 
    defaultSubscription, 
    Vendor, 
    vendorApplicationStatus, 
    VendorStore, 
    VendorSubscription 
} from '../../types/index.js';

interface Response {
    status: number,
    error: boolean, 
    data: unknown
}

interface VendorMethods {
    subscriptionIsActive(): boolean; 
}

interface VendorModelStatics extends Model<Vendor, object, VendorMethods> {
    createVendor(vendor: Vendor): Promise<HydratedDocument<Vendor, VendorMethods>>;
    getAll(): Promise<Array<HydratedDocument<Vendor, VendorMethods>>>;
    getById(id: Types.ObjectId | string): Promise<HydratedDocument<Vendor, VendorMethods>>;
    updateApplicationStatus(id: Types.ObjectId | string, status: string): Promise<Response>;
    createSubscription(id: Types.ObjectId | string, subcription: VendorSubscription): Promise<Response>;
    cancelSubscription(id: Types.ObjectId | string, cancel: boolean): Promise<Response>;
    updateSubscriptionStatus(id: Types.ObjectId | string, active: boolean): Promise<Response>;
    addStore(id: Types.ObjectId | string, store: VendorStore): Promise<Response>;
    removeStore(id: Types.ObjectId | string, storeId: string | Types.ObjectId): Promise<Response>;
}

// TODO... use proper type for application, subscription, stores
const VendorSchema = new Schema<Vendor, VendorModelStatics, VendorMethods>({
    accountId: {type: String, required: true },
    application: { type: Object },
    subscription: { type: Object },
    stores: [{}],
    createdAt: { type: Date, default: Date.now },
})


VendorSchema.method('subscriptionIsActive', function subscriptionIsActive(): boolean {
    return this.subscription.active;
});


VendorSchema.static('createVendor', async function createVendor(
    vendor: Vendor
): Promise<HydratedDocument<Vendor, VendorMethods>> {
    console.log("vendor in model", vendor);

    return await this.create({
        accountId: vendor.accountId, 
        application: vendor.application, 
        stores: vendor.stores
    });
});

VendorSchema.static('getAll', async function getAll(

): Promise<Array<HydratedDocument<Vendor, VendorMethods>>> {
    return await this.find({});
});

VendorSchema.static('getById', async function getById(
    id: Types.ObjectId | string
): Promise<HydratedDocument<Vendor, VendorMethods>> {
    return await this.findOne({ _id: id });
});

VendorSchema.static('updateApplicationStatus', async function updateApplicationStatus(
    id: Types.ObjectId | string, 
    status: vendorApplicationStatus
): Promise<Response> {
    const vendor = await this.updateOne(
        { $or:[ {_id: id}, {accountId: id} ] }, 
        { "$set": { application: { status: status } } }
    );
    return ({status: 201, error: false, data: vendor});
});

VendorSchema.static('createSubscription', async function createSubscription(
    id: Types.ObjectId | string, 
    subscription: VendorSubscription
): Promise<Response> {
    await this.updateOne(
        { _id: id }, 
        { "$set": {"subscription": subscription} }
    );

    return ({status: 201, error: false, data: null});
});

VendorSchema.static('cancelSubscription', async function cancelSubscription(
    id: Types.ObjectId | string, 
    cancel: boolean
): Promise<Response> {
    if (cancel) {
        const cancelSubscriptionResponse = await this.updateOne(
            { _id: id }, 
            { "$set": {"subscription": defaultSubscription} }
        );
    
        return ({status: 201, error: false, data: cancelSubscriptionResponse});
    }
});

VendorSchema.static('updateSubscriptionStatus', async function updateSubscriptionStatus(
    id: Types.ObjectId | string, 
    isActive: boolean
): Promise<Response> {
    const cancelSubscriptionResponse = await this.updateOne(
        { _id: id }, 
        { "$set": {subscription: {active: isActive}} }
    );
    return ({status: 201, error: false, data: cancelSubscriptionResponse});
});


VendorSchema.static('addStore', async function addStore(
    id: Types.ObjectId | string, 
    store: VendorStore
): Promise<Response> {
    const response = await this.updateOne(
        { _id: id }, 
        { $push: {"stores": store} }
    );

    return ({status: 201, error: false, data: response});
});

VendorSchema.static('removeStore', async function removeStore(
    id: Types.ObjectId | string, 
    storeId: string | Types.ObjectId
): Promise<Response> {
    const response = await this.updateOne(
        { _id: id },  
        { $pull: { stores: { id: storeId } } }
    );
    return ({status: 201, error: false, data: response});

});


const VendorModel = model<Vendor, VendorModelStatics>('vendor', VendorSchema);
export default VendorModel;