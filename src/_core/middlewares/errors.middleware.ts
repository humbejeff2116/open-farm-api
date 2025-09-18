import type { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger.utils.js";
import { errorHandler, type APIError } from "../../utils/error.utils.js";


export const notFoundRouteHandler = async (req: Request, res: Response) => {
    logger.warn('route not found');
    res.status(404).json('route not found');
}


// log and forward error
export const errorLogerHandler = async (
    err: Error, 
    _req: Request, 
    _res: Response, 
    next: NextFunction
) => {
    logger.error('centralized error handling->>>>', err);
    next(err);
}

// handle operational errors
export const operationalErrorHandler = async (
    err: APIError, 
    _req: Request, 
    res: Response, 
    next: NextFunction
) => {
    if (!errorHandler.isTrustedError(err)) {
        next(err);
    }
    await errorHandler.handleOperationalError(err, res);
}

export const finalErrorHandler = async (
    err: Error, 
    _req: Request, 
    res: Response
) => {
    await errorHandler.handleError(err, res);
}
