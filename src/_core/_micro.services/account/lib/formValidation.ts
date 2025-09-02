import { validationResult } from 'express-validator';
import { Request, Response } from 'express';



export default function validateForm(req: Request, res: Response, message?: string) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) { 
        const response = {
            status: 422,
            error: true,
            alreadySubscribed: true,
            valErrors: errors.array(),
            message: message ?? "Form validation failed",
        }
        return res.status(422).json(response); 
    }
} 