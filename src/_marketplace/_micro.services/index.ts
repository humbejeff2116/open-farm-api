import  { router as accountRoutes } from '../../_core/_micro.services/account/routes/index.js';
import  { router as searchRoutes } from './search/routes/index.js';
import  { router as storeRoutes } from './store/routes/index.js';
import  { router as vendorRoutes } from './vendor/routes/index.js';
import   { router as walletRoutes }  from '../../_core/_micro.services/wallet/routes/index.js';
import  { router as transactionRoutes } from '../../_core/_micro.services/transaction/routes/index.js';
import  { router as notificationRoutes } from '../../_core/_micro.services/notification/routes/index.js';
// import  { router as paymentRoutes } from './payment/routes/index.js';
import  { router as orderRoutes } from './order/routes/index.js';
// import  { router as reviewRoutes } from './review/routes/index.js';
// TODO... remove this file
// REASON... import and use individual router in src/index.ts from each service
export {
    accountRoutes,
    searchRoutes,
    storeRoutes,
    vendorRoutes,
    walletRoutes,
    transactionRoutes,
    notificationRoutes,
    // paymentRoutes,
    orderRoutes,
    // reviewRoutes
}