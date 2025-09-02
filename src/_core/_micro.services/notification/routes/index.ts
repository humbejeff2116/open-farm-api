import { Hono } from 'hono';


const notificationRouter = new Hono();

notificationRouter.post('/sign-up', notificationController.create);
notificationRouter.post('/sign-in', notificationController.create);

export default notificationRouter;