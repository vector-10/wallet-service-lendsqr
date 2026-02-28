import { Request, Response, NextFunction } from 'express';
import { sendError } from './response';

type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export const asyncHandler = (fn: AsyncController): AsyncController => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  };
};
