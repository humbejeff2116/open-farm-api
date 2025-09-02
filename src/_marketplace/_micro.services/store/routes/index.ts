import { Hono } from 'hono';


const storeRouter = new Hono();

storeRouter.post('/sign-up', storeController.create);
storeRouter.post('/sign-in', storeController.create);

export default storeRouter;