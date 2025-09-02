import { Types } from 'mongoose';
import VendorModel from '../models/index.js';
import { Vendor, vendorApplicationStatus, VendorSubscription } from '../../types/index.js';

class VendorManagementDbInterface {
    async createVendor(vendor: Vendor) {
        try {
            const res = await VendorModel.createVendor(vendor);
            return res;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async getAll() {
        try {
            const res = await VendorModel.getAll();
            return res;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async getVendor(vendorId: Types.ObjectId | string) {
        try {
            const res = await VendorModel.getById(vendorId);
            return res;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async approveVendor(
        vendorId: Types.ObjectId | string, 
        status: vendorApplicationStatus
    ) {
        try {
            const res = await VendorModel.updateApplicationStatus(vendorId, status);
            return res;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async createVendorSubscription(vendorId: Types.ObjectId | string, subcription: VendorSubscription) {
        try {
            const res = await VendorModel.createSubscription(vendorId, subcription);
            return res;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async cancelVendorSubscription(vendorId: Types.ObjectId | string, cancel: boolean) {
        try {
            const res = await VendorModel.cancelSubscription(vendorId, cancel);
            return res;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}

const vendorManagementDbInterface = new VendorManagementDbInterface();
export default vendorManagementDbInterface;