import { Hono } from 'hono';


const transactionRouter = new Hono();

transactionRouter.post('/sign-up', transactionController.create);
transactionRouter.post('/sign-in', transactionController.create);

export default transactionRouter;