import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import configs from '../configs/index.js';


export function signJsonWebToken(user) {
    const { email, _id } = user;
    const token_payload = { email, id: _id };
    const token = jwt.sign(token_payload, configs.secret.jwtSecret, { expiresIn: '1h' });
    return token;
}


export function define__dirname() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return __dirname;
}

const exclude = ["password", "createdAt"];
export async function filterUser(obj) {
    for (let i = 0; i < exclude.length; i++) {
        if (obj[exclude[i]]) {
            obj[exclude[i]] = null;
        }
    }
    return obj; 
}