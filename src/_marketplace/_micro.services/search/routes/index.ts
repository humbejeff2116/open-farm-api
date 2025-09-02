import { Hono } from 'hono';


const searchRouter = new Hono();

searchRouter.post('/sign-up', searchController.create);
searchRouter.post('/sign-in', searchController.create);

export default searchRouter;