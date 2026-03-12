import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { sendError } from '../utils';


export const validateBody = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body)

        if (!result.success) {
            const message = result.error.issues[0].message
            sendError(res, message, 400)
            return
        }

        req.body = result.data
        next()
    }
}
