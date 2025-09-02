import { Request } from "express";
import { userSession } from "../../../../state/index.js";
import { SessionData } from "express-session";

const accountSessionService = {
    set(req: Request) {
        userSession.setRequest(req);
        return this;
    },

    async get() {
        return userSession.getSession();
    },

    save<Type>(key: string, val: Type) {
       return userSession.saveToSession(key, val);
    },

    async deleteSession() {
        return userSession.deleteSession();
    },
    
    async deleteAll() {
        return userSession.deleteAllSession();
    }
}

export default accountSessionService;