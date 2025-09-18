import { Router } from 'express';
import { authMiddleware, requireRole } from '../../../middlewares/auth/index.js';
import userController from '../controllers/user.controller.js';

const accountRouter = Router();


accountRouter.post(
    '/:id/signup-successfull/:invitesCode',
    authMiddleware,  
    requireRole(["farmer", "admin", "agent"]),
    userController.userSignupSuccessfull
);

export default accountRouter;