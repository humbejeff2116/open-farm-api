import { Request, Response } from 'express';
import { exceptionsInterface } from "../../../exceptions/index.js";
import { JSONErrorResponse } from "./responses.js";


const logs = {
    handleUserException(
        res: Response, 
        status: number, 
        errorExist: boolean, 
        message: string, 
        error: string
    ) {
        const response: JSONErrorResponse = {
            status,
            error: errorExist,
            message,
        }
         
        this.sendErrorLogsToExceptionsTier(error);
        return res.status(500).json(response);
    },
    sendErrorLogsToExceptionsTier(err) {
        exceptionsInterface.collect(err);
    }
}


export default logs;