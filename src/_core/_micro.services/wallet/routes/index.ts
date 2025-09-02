import { Hono } from 'hono';


const walletRouter = new Hono();

walletRouter.post('/sign-up', walletController.create);
walletRouter.post('/sign-in', walletController.create);

export default walletRouter;