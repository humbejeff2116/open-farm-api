import path from 'node:path';
import express from 'express';
import morganLogger from 'morgan';
import session from 'express-session';
import cookie from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { fileURLToPath } from 'node:url';


import farmerRouter from './_core/_micro.services/farmer/routes/index.js';
import agentRouter from './_core/_micro.services/agent/routes/index.js';
import reportsRouter from './_core/_micro.services/reports/routes/index.js';
import inviteCodesRouter from './_core/_micro.services/inviteCodes/routes/index.js';
import { errorHandler, notFound } from './_core/middlewares/errors/index.js';
import { authMiddleware } from './_core/middlewares/auth/index.js';
import reportFiltersRouter from './_core/_micro.services/reports/routes/reportFilters/index.js';



const app = express();
const API_VERSION = '/api/v1';
const corsOptions = {
    credentials: true,
    origin: process.env.CORS_ORIGIN_URL,
    optionsSuccessStatus: 200
}

app.disable('x-powered-by');
// enable this if you run server behind a proxy (e.g. nginx)
// app.set('trust proxy', 1);
app.use(helmet());
app.use(morganLogger('dev'));
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended:true }));
app.use(cookie(process.env.COOKIE_SECRET as string));
app.use(session({
    // store: sessionRedisStore,
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: false,
        secure: false,
        httpOnly: false,
        maxAge: 1000 * 60 * 60 * 2 // expires after 2 hours
    }
}));


app.use(express.static(path.join(process.cwd(), 'public')));
app.use(`${API_VERSION}/agents`, agentRouter);
app.use(`${API_VERSION}/farmers`, farmerRouter);
app.use(`${API_VERSION}/invite-codes`, inviteCodesRouter);
app.use(`${API_VERSION}/reports`, reportsRouter);
app.use(`${API_VERSION}/report-filters`, reportFiltersRouter)
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use(notFound);
app.use(errorHandler);

// Get the current file's path using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if the current file is the main entry point
if (process.argv[1] === __filename) {
    const port = Number(process.env.PORT ?? 4000);
    app.listen(port, () => console.log(`API listening on :${port}`));
}


// if (require.main === module) {
//     const port = Number(process.env.PORT ?? 4000);
//     app.listen(port, () => console.log(`API listening on :${port}`));
// }

export default app;