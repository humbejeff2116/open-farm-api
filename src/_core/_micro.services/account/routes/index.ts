import { Hono } from 'hono';


const accountRouter = new Hono();

accountRouter.post('/sign-up', accountController.create);
accountRouter.post('/sign-in', accountController.create);

export default accountRouter;