import { NextFunction, Request, Response } from "express";
import userSessionService from "../services/session/index.js";
import { jwtService } from "../lib/jwt.js";
import logs from '../lib/exceptions.js';
const { handleUserException } = logs;


class AuthMiddleWare {
    async authVendor(req: Request, res: Response, next: NextFunction) {
        try {
            const userSession = await userSessionService.set(req).get();
            const loginCookie = JSON.parse(req.cookies.loginCookie);
            const clientJwt = loginCookie["x-access-token"];
    
    
            if (!loginCookie) {
                return res.status(401).send({status: 401, success: false, message: 'Un authorized'});
            }
    
            if (loginCookie["x-access-token"] !== userSession?.user.jwtToken) {
                console.log("tokens doesnt match");
                const response = {
                    status: 403,
                    authenticated: false
                }
                return res.status(200).json(response);
            }
    
            const decodedToken = await jwtService.verify(clientJwt);
            console.log("decoded token is",decodedToken)
    
            if (!decodedToken ||  decodedToken.expired) {
                const response = {
                    status: 403,
                    authenticated: false
                }
                return res.status(200).json(response);
            }
    
            next();
        } catch (err) {
            console.error(err);
            handleUserException(res, 200, true, "Error occured while authenticating user", err);
        }
    }
}

const authMiddleWare = new AuthMiddleWare();
export default authMiddleWare;