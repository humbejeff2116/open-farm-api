// import { Router } from "express";
// import vendorManagementController from '../controllers/index.js';
// const router = Router();
import { Hono } from 'hono';
import vendorController from '../controllers/index.js';

// Create a Hono instance for 'vendor' related routes
const vendorRouter = new Hono();

vendorRouter.post('/apply', vendorController.applyVendor);

vendorRouter.get('/', (c) => c.text('List vendors'));
vendorRouter.get('/:id', (c) => {
    const id = c.req.param('id');
    return c.text(`Get vendor: ${id}`);
});




export default vendorRouter;