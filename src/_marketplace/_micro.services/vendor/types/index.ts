import { Types } from 'mongoose';


export interface Vendor {
    _id?: Types.ObjectId
    accountId: Types.ObjectId | string 
    application: VendorApplication
    subscription?: VendorSubscription 
    // TODO... check date type
    cancelSubscriptions?: Array<{
        id: string, 
        reason: string, 
        date: Date, 
    }>
    stores?: Array<VendorStore>
    createdAt?: Date,
}
export type vendorApplicationStatus = 'pending' | 'approved';

export interface VendorApplication {
    type: string
    status: vendorApplicationStatus 
    date: Date | string
}

export interface VendorSubscription {
    id?: string
    billingType: string
    storeType: string
    active: boolean
    startDate: Date | null
    endDate: Date | null
}

export interface VendorStore {
    id: string |  Types.ObjectId
}

export const vendorApplicationStatus = {
    pending: 'pending',
    approved: 'approved'
}

export const subscriptionTypes = {
    monthly: 'monthly',
    yearly: 'yearly'
}

export const defaultSubscription: VendorSubscription = {
    billingType: subscriptionTypes.monthly,
    storeType: 'standard',
    active: false,
    startDate: null,
    endDate: null,
}