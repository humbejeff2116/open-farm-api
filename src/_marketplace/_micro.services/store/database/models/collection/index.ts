import { 
    Schema, 
    model, 
    Types, 
    Model, 
    HydratedDocument 
} from 'mongoose';
import { 
    StoreCollection, 
    StoreCollectionProduct 
} from '../../../types/index.js';


interface Response {
    status: number,
    error: boolean, 
    data: unknown
}

interface CollectionMethods {
    getDiscount(): number; 
}

interface CollectionModelStatics extends Model<StoreCollection, object, CollectionMethods> {
    createStoreCollection(collection: StoreCollection): Promise<HydratedDocument<StoreCollection, CollectionMethods>>;
    get(id: Types.ObjectId | string): Promise<HydratedDocument<StoreCollection, CollectionMethods>>;
    getStoreCollections(storeId: Types.ObjectId | string): Promise<HydratedDocument<StoreCollection, CollectionMethods>>;
    remove(id: Types.ObjectId | string, storeId: Types.ObjectId | string): Promise<Response>;
    removeProduct(
        id: Types.ObjectId | string, 
        storeId: Types.ObjectId | string,
        productId: Types.ObjectId | string
    ): Promise<Response>;
    addProduct(
        id: Types.ObjectId | string,
        storeId: Types.ObjectId | string,
        product: StoreCollectionProduct
    ): Promise<Response>;
}

const CollectionSchema = new Schema<StoreCollection, CollectionModelStatics, CollectionMethods>({
    // vendorId: { type: String, required: true },
    storeId: { type: String, required: true },
    name: { type: String, required: true },
    products: [{}],
    createdAt: { type: Date, default: Date.now },
})

CollectionSchema.static('createStoreCollection', async function createStoreCollection(
        collection: StoreCollection
    ): Promise<HydratedDocument<StoreCollection, CollectionMethods>> {
    console.log("collection in model", collection);

    return await this.create({
        name: collection.name, 
        storeId: collection.storeId,
        products: collection?.products ?? [{}],
    });
});

CollectionSchema.static('addProduct', async function addProduct(
    collectionId: Types.ObjectId | string,
    storeId: Types.ObjectId | string,
    product: StoreCollectionProduct
): Promise<Response> {
    const addProduct = await this.updateOne(
        { $and: [{_id: collectionId}, {storeId: storeId}]}, 
        {$push: {products: product}}
    )
    return ({status: 201, error: false, data: addProduct});
});

CollectionSchema.static('get', async function get(
    id: Types.ObjectId | string
): Promise<HydratedDocument<StoreCollection, CollectionMethods>> {
    const collection = await this.findOne({ _id: id });
    return collection;
});

CollectionSchema.static('getStoreCollections', async function getStoreCollections(
    storeId: Types.ObjectId | string
): Promise<Array<HydratedDocument<StoreCollection, CollectionMethods>>> {
    const collections = await this.find({ storeId: storeId });
    return collections;
});


CollectionSchema.static('remove', async function remove(
    id: Types.ObjectId | string, 
    storeId: Types.ObjectId | string
): Promise<Response> {
    const removeCollection = await this.findOneAndDelete(
        { $and: [{_id: id}, {storeId: storeId}] }
    );
    return ({status: 201, error: false, data: removeCollection});
});

CollectionSchema.static('removeProduct', async function removeProduct(
    id: Types.ObjectId | string, 
    storeId: Types.ObjectId | string,
    productId: Types.ObjectId | string
): Promise<Response> {
    const removeProd = await this.updateOne(
        { $and: [{_id: id}, {storeId: storeId}] },  
        { $pull: { products: { id: productId }} }
    );
    return ({status: 201, error: false, data: removeProd});
});


const StoreCollectionModel = model<StoreCollection, CollectionModelStatics>('storecollections', CollectionSchema);
export default StoreCollectionModel;