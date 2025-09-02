import { Types } from "mongoose";
import type { Vendor, vendorApplicationStatus } from "../types/index.js";
// import type { vendorApplicationStatus } from "../types/index.js";
import vendorManagementDbInterface from "../database/interface/index.js";

const vendorService = {
    async applyVendor(vendor: Vendor) {
        try {
            const application = await vendorManagementDbInterface.createVendor(vendor);
            return ({
                success: true,
                status: 200,
                error: false,
                message: 'vendor application submitted',
                data: application
            })
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async approveVendor(
        vendorId: Types.ObjectId | string, 
        status: vendorApplicationStatus
    ) {
        try {

            if (!await this.getVendor(vendorId)) {
                return ({
                    success: false,
                    status: 400,
                    message: 'vendor not found',
                    data: null
                })
            }

            const approveVendor = await vendorManagementDbInterface.approveVendor(vendorId, status);
            
            return ({
                ...approveVendor,
                message: 'Vendor approved successfully',
            })
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async createVendorSubscription(vendorId: Types.ObjectId | string, subcription: VendorSubscription) {
        try {
            if (!await this.getVendor(vendorId)) {
                return ({
                    success: false,
                    status: 400,
                    message: 'Vendor not found',
                    data: null
                })
            }

            const subscribeVendor = await vendorManagementDbInterface.createVendorSubscription(vendorId, subcription);
            return ({
                ...subscribeVendor,
                message: 'Vendor subscribed succesfully',
            })
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async cancelVendorSubscription(vendorId: Types.ObjectId | string, cancel: boolean) {
        try {
            if (!await this.getVendor(vendorId)) {
                return ({
                    success: false,
                    status: 400,
                    message: 'Vendor not found',
                    data: null
                })
            }

            const cancelSubscription = await vendorManagementDbInterface.cancelVendorSubscription(vendorId, cancel);
            return ({
                ...cancelSubscription,
                message: 'Vendor subscription canceled succesfully',
            })
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getAllVendors() {
        try {
            return await vendorManagementDbInterface.getAll();
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async getVendor(vendorId: Types.ObjectId | string) {
        try {
            return await vendorManagementDbInterface.getVendor(vendorId);
        } catch (err) {
            console.error(err);
            throw err;
        }
    },
}

export default vendorService;