import { Router } from 'express';
import walletController from '../controllers/wallet.controller.js';

const walletRouter = Router();

walletRouter.get('/:id', 
    walletController.getWallet
);


export default walletRouter;