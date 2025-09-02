import { NextFunction, Request, Response } from 'express';
import { APIError, HttpStatusCode } from '../../../../_core/lib/logs/errorHandler.js';
import vendorService from '../services/index.js';
import storeService from '../../store/services/index.js';

class Controller {
    async applyVendor(req:Request, res: Response, next: NextFunction) {
        const { vendor } = req.body;

        try {
            const applyResponse = await vendorService.applyVendor(vendor);
            return res.status(200).json(applyResponse);
        } catch { 
            next(new APIError('Apply vendor Error', HttpStatusCode.INTERNAL_SERVER));       
        }
    }

    async approveVendor(req:Request, res: Response, next: NextFunction) { 
        const { vendorId, status } = req.body;

        try {
            const approveVendor = await vendorService.approveVendor(vendorId, status);
            const setupVendorStore = await storeService.setUpStore(approveVendor.data);
            
            const jsonResponse = {
                status: 200,
                error: false,
                data: setupVendorStore.data,
                message: 'Approved vendor successfully',
            }
            return res.status(200).json(jsonResponse); 
        } catch (err) {
            next(err);
        }    
    }

    async getVendor(req:Request, res: Response, next: NextFunction) {
        const { vendorId } = req.params
        try {
            const vendor = await vendorService.getVendor(vendorId);

            const jsonResponse = {
                status: 200,
                error: false,
                data: vendor,
                message: 'Vendor gotten successfully',
            }
            return res.status(200).json(jsonResponse);

        } catch (err) {
            next(err);
        } 
    }

    async subscribeVendor(req:Request, res: Response, next: NextFunction) { 
        const { vendorId } = req.params;
        const { subscription } = req.body;
        try {
            const subscribeVendorResp = await vendorService.createVendorSubscription(vendorId, subscription);

            return res.status(200).json(subscribeVendorResp);
        } catch (err) {
            next(err);
        } 
    }

    // TODO... implement commented code functionality when needed

    // async suspendVendor(req:Request, res: Response) {
    //     try {
    //         const approveVendor = await vendorService.(vendorId);

    //     } catch (err) {
    //         next(err);
    //     } 
    // }

    // async disableVendor(req:Request, res: Response, next: NextFunction) {
    //     try {
    //         const disableVendor = await vendorService.;
    //         return res.status(200).json(approveVendor.)
    //     } catch (err) {
    //         next(err);
    //     } 
    // }

    // async deactivateVendor(req:Request, res: Response, next: NextFunction) {
    //     try {
    //         const approveVendor = await vendorService.getVendor(vendorId);

    //     } catch (err) {
    //         next(err);
    //     } 
    // }
}

const vendorController = new Controller();
export default vendorController;