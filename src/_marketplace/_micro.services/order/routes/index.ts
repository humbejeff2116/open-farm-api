import { Hono } from 'hono';


const orderRouter = new Hono();

orderRouter.post('/sign-up', orderController.create);
orderRouter.post('/sign-in', orderController.create);

export default orderRouter;