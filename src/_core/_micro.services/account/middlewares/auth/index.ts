import { NextFunction, Request, Response } from 'express';
import { jwtService } from "../../lib/jwt.js";
import { APIError, HttpStatusCode } from '../../../logs/errorHandler.js';
import accountManagementService from '../../services/index.js';
import { JsonWebTokenError } from 'jsonwebtoken';


export default async function authenticateToken(req: Request, res: Response, next: NextFunction) {
    try {
        const authResponse = await authTokenAndGetAccount(req);
        
        if (authResponse.accountExist) {
            next();
        }
    } catch (err) {
         if (err instanceof JsonWebTokenError) {
            next(new APIError('Invalid token', HttpStatusCode.UNAUTHORIZED));
        } else {
            next(err);
        }
        // next(new APIError('Error authenticating token', HttpStatusCode.FORBIDDEN));
    }
}

export async function authTokenAndGetAccount(req: Request) {
    const token = jwtService.extractFromReq(req);
      
    if (!token) {
        throw new APIError("Unauthorized", HttpStatusCode.UNAUTHORIZED);
    }

    if (!await jwtService.isValid(token)) {
        throw new APIError('Token expired', HttpStatusCode.UNAUTHORIZED);
    }

    const decodeToken = await jwtService.decode(token);
    const tokenPayload = jwtService.getPayload(decodeToken);
    const account = await accountManagementService.getAccountById(tokenPayload);
    // TODO... remove
    console.log('account::middlewares::auth::index::authTokenAndGetAccount--->', decodeToken);

    if (!account) {
        throw new APIError("Account not found", HttpStatusCode.UNAUTHORIZED);
    }
    return ({
        accountExist: true,
        account
    })
}