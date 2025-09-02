import { Schema, model, Types, Model, HydratedDocument, } from 'mongoose';
import { TradeOrder } from '../../types/index.js';

interface UpdateResponse {
    status: number,
    error: boolean, 
    data: unknown
}

interface OrderMethods {
    getDiscount(): number; 
}

interface OrderModelStatics extends Model<TradeOrder, object, OrderMethods> {
    createOrder(order: TradeOrder): Promise<HydratedDocument<TradeOrder, OrderMethods>>;
    getAll(): Promise<Array<HydratedDocument<TradeOrder, OrderMethods>>>;
    getWithLimitAndSkip(limit: number, skip: number): Promise<Array<HydratedDocument<TradeOrder, OrderMethods>>>;
    getOrder(id: Types.ObjectId | string): Promise<HydratedDocument<TradeOrder, OrderMethods>>;
    getStoreOrders(storeId: Types.ObjectId | string): Promise<HydratedDocument<TradeOrder, OrderMethods>>;
    getBuyerOrders(buyerId: Types.ObjectId | string): Promise<HydratedDocument<TradeOrder, OrderMethods>>;
    updateOrder<Type>(id: Types.ObjectId | string, key: string, newValue: Type): Promise<UpdateResponse>;
    removeOrder(id: Types.ObjectId | string): Promise<UpdateResponse>;
}

const OrderSchema = new Schema<TradeOrder, OrderModelStatics, OrderMethods>({
    timestamp: { type: String, required: true },
    storeId: { type: String, required: true },
    buyerId: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    delivered: { type: Boolean, required: true },
    products: [{}],
    createdAt: { type: Date, default: Date.now },
})


OrderSchema.static('createOrder', async function createOrder(
    order: TradeOrder
): Promise<HydratedDocument<TradeOrder, OrderMethods>> {
    console.log("order in model", order);

    return this.create({ 
        timestamp: order.timestamp,
        storeId: order.storeId,
        buyerId: order.buyerId,
        totalAmount: order.totalAmount,
        delivered: order.delivered,
        products: order.products,
    });
});

OrderSchema.static('getAll', async function getAll(

): Promise<Array<HydratedDocument<TradeOrder, OrderMethods>>> {
    const orders = await this.find({});
    return orders;
});


OrderSchema.static('getWithLimitAndSkip', async function getWithLimitAndSkip(
    limit: number, 
    skip: number
): Promise<Array<HydratedDocument<TradeOrder, OrderMethods>>> {
    const orders = await this.find({}).limit(limit).skip(skip);
    return orders;
});

OrderSchema.static('getOrder', async function getOrder(
    id: Types.ObjectId | string
): Promise<HydratedDocument<TradeOrder, OrderMethods>> {
    const order = await this.findOne({ _id: id });
    return order;
});

OrderSchema.static('getStoreOrders', async function getVendorOrders(
    storeId: Types.ObjectId | string, 
): Promise<Array<HydratedDocument<TradeOrder, OrderMethods>>> {
    const orders = await this.find({ storeId: storeId });
    return orders;
});

OrderSchema.static('getBuyerOrders', async function getBuyerOrders(
    buyerId: Types.ObjectId | string,
): Promise<Array<HydratedDocument<TradeOrder, OrderMethods>>> {
    const orders = await this.find({  buyerId:  buyerId });
    return orders;
});

OrderSchema.static('updateOrder', async function updateOrder<Type>(
    id: Types.ObjectId | string,
    // userId: Types.ObjectId | string, 
    key: string, 
    newValue: Type
): Promise<UpdateResponse> {
    await this.updateOne(
        { $and: [{_id: id}] }, 
        { "$set": {[key]: newValue} }
    );

    const order = await this.findOne({ _id: id });
    return ({status: 201, error: false, data: order});
});


OrderSchema.static('removeOrder', async function removeOrder(
    id: Types.ObjectId | string, 
    // userId: Types.ObjectId | string
): Promise<UpdateResponse> {
    const removeOrder = await this.findOneAndDelete({ $and: [{_id: id}] });
    return ({status: 201, error: false, data: removeOrder});
});


const OrderModel = model<TradeOrder, OrderModelStatics>('order', OrderSchema);
export default OrderModel;