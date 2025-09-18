// import { AnyZodObject } from "zod";
import type { Request, Response, NextFunction } from "express";
import type { AnyZodObject } from "zod/v3";

export function validate(schema: AnyZodObject, type: "body" | "query" | "params" = "body") {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req[type]);
            next();
        } catch (err: any) {
            return res.status(400).json({
                error: "Validation failed",
                details: err.errors || err.message,
            });
        }
    };
}
