import { Request } from 'express';
import jwt from 'jsonwebtoken';
import configs from '../configs/index.js';


interface DecodedToken {
    expired: boolean 
    data: jwt.VerifyErrors | string | jwt.JwtPayload
}

class JwtService {
    private secret = configs.secret.jwtSecret;
    private decodeToken: DecodedToken;

    sign(payload: {id: string}, expiresIn?: string | number) {
        // TODO... encode id before signing
        const token = jwt.sign(
            payload, 
            this.secret, 
            { expiresIn: expiresIn || '1h' }
        );
        return token;
    }

    decode(token: string): Promise<DecodedToken> {
        return new Promise((res, rej) => {
            jwt.verify(token, this.secret, function (err, decoded) {
                if (err) {
                    if (err.name === "TokenExpiredError") {
                        res({
                            expired: true,
                            data: err
                        });
                    }
                   rej(err);
                }
                res({
                    expired: false,
                    data: decoded
                });
            });
        })
    }

    extractFromReq(req: Request) {
        const token = req.body['x-access-token'] || req.query['x-access-token'] || req.headers['x-access-token'];
        return token;
    }

    async isValid(
        token: string 
        // | 
        // {
        //     expired: boolean;
        //     data: jwt.VerifyErrors | string | jwt.JwtPayload;
        // }, 
        // tokenPassedIsDecoded?: boolean
    ) {
        // if (tokenPassedIsDecoded && typeof token !== 'string') {
        //     if (token.expired) {
        //         return false;
        //     }
        //     return true;
        // } 
        // else {
            const decodeToken = await this.decode(token);

            if (decodeToken.expired) {
                return false;
            }
            return true;
        // }  
    }

    getPayload(decodedToken: jwt.JwtPayload) {
        return decodedToken.sub;
    }
}
export const jwtService = new JwtService();



