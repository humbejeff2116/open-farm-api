import { Schema, model, Types, Model, HydratedDocument, } from 'mongoose';
import { StoreProduct } from '../../../types/index.js';

interface UpdateResponse {
    status: number
    error: boolean
    // message: string 
    data: unknown
}

interface ProductMethods {
    getDiscount(): number; 
}

// TODO... type like() -> userLike parameter
interface ProductModelStatics extends Model<StoreProduct, object, ProductMethods> {
    createProduct(product: StoreProduct): Promise<HydratedDocument<StoreProduct, ProductMethods>>;
    getAll(): Promise<Array<HydratedDocument<StoreProduct, ProductMethods>>>;
    getWithLimitAndSkip(limit: number, skip: number): Promise<Array<HydratedDocument<StoreProduct, ProductMethods>>>;
    get(id: Types.ObjectId | string): Promise<HydratedDocument<StoreProduct, ProductMethods>>;
    like(id: Types.ObjectId | string, userLike): Promise<UpdateResponse>
    removeLike(id: Types.ObjectId | string, userLike): Promise<UpdateResponse>
    update<Type>(id: Types.ObjectId | string, key: string, newValue: Type): Promise<UpdateResponse>;
    remove(id: Types.ObjectId | string): Promise<UpdateResponse>;
    // vendor  methods
    getAllStore(storeId: Types.ObjectId | string): Promise<Array<HydratedDocument<StoreProduct, ProductMethods>>>;
    getAllStoreCollection(
        storeId: Types.ObjectId | string,
        collectionId: Types.ObjectId | string,
    ): Promise<Array<HydratedDocument<StoreProduct, ProductMethods>>>;
    getStore(
        storeId: Types.ObjectId | string,
        productId: Types.ObjectId | string,
    ): Promise<HydratedDocument<StoreProduct, ProductMethods>>;
}

const ProductSchema = new Schema<StoreProduct, ProductModelStatics, ProductMethods>({
    vendorId: { type: String, required: true },
    storeId: { type: String, required: true },
    collectionId: { type: String, required: true  },
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true},
    numSold: { type: Number, required: true },
    discount: { type: Number, required: true },
    category: { type: String, required: true },
    likesCount: { type: Number, default: 0 }, 
    likes: [{}],
    createdAt: { type: Date, default: Date.now },
})


ProductSchema.static('createProduct', async function createProduct(
    product: StoreProduct
): Promise<HydratedDocument<StoreProduct, ProductMethods>> {
    console.log("product in model", product);

    return this.create({ 
        vendorId: product.vendorId,
        storeId: product.storeId,
        collectionId: product.collectionId,
        name: product.name,
        description: product.description,
        price: product.price,
        numSold: product.numSold,
        discount: product.discount,
        category: product.category,
    });
});

ProductSchema.static('getAll', async function getAll(

): Promise<Array<HydratedDocument<StoreProduct, ProductMethods>>> {
    const products = await this.find({});
    return products;
});


ProductSchema.static('getWithLimitAndSkip', async function getWithLimitAndSkip(
    limit: number, 
    skip: number
): Promise<Array<HydratedDocument<StoreProduct, ProductMethods>>> {
    const products = await this.find({}).limit(limit).skip(skip);
    return products;
});

ProductSchema.static('get', async function get(
    id: Types.ObjectId | string
): Promise<HydratedDocument<StoreProduct, ProductMethods>> {
    const product = await this.findOne({ _id: id });
    return product;
});

// vendor methods
ProductSchema.static('getAllStore', async function getAllStore(
    storeId: Types.ObjectId | string
): Promise<Array<HydratedDocument<StoreProduct, ProductMethods>>> {
    const product = await this.find({storeId});
    return product;
});

ProductSchema.static('getAllStoreCollection', async function getAllStoreCollection(
    storeId: Types.ObjectId | string,
    collectionId: Types.ObjectId | string,
): Promise<Array<HydratedDocument<StoreProduct, ProductMethods>>> {
    const products = await this.find({ $and: [{storeId}, {collectionId}]});
    return products;
});

ProductSchema.static('getStore', async function getStore(
    storeId: Types.ObjectId | string,
    productId: Types.ObjectId | string,
): Promise<HydratedDocument<StoreProduct, ProductMethods>> {
    const product = await this.findOne({ $and: [{storeId}, {_id: productId}]});
    return product;
});

ProductSchema.static('update', async function update<Type>(
    id: Types.ObjectId | string, 
    key: string, 
    newValue: Type
): Promise<UpdateResponse> {
    await this.updateOne({ _id: id }, { "$set": {[key]: newValue} });

    const product = await this.findOne({ _id: id });
    return ({status: 201, error: false, data: product});
});

ProductSchema.static('like', async function like(
    id: Types.ObjectId | string, 
    userLike
): Promise<UpdateResponse> {
    const updateProd = await this.updateOne({ _id: id }, { $push: {likes: userLike }, $inc: { likesCount: 1 }});
    return ({status: 201, error: false, data: updateProd});
});

ProductSchema.static('removeLike', async function removeLike(
    id: Types.ObjectId | string, userLike
): Promise<UpdateResponse> {
    const updateProd = await this.updateOne({ _id: id },  { $pull: { likes: { userId: userLike.userId }, $inc: { likesCount: -1 } }});
    return ({status: 201, error: false, data: updateProd});
});

ProductSchema.static('remove', async function remove(
    id: Types.ObjectId | string
): Promise<UpdateResponse> {
    const removeProduct = await this.findByIdAndDelete({ _id: id });
    return ({status: 201, error: false, data: removeProduct});
});

// instance methods
ProductSchema.method('getDiscount',function getDiscount(): number {
    return this.discount
});

const ProductModel = model<StoreProduct, ProductModelStatics>('product', ProductSchema);
export default ProductModel;