import { Request, Response, NextFunction } from 'express';
import { sendError } from './response';
import { AppError } from './errors';

type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export const asyncHandler = (fn: AsyncController): AsyncController => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error: unknown) {
      const statusCode = error instanceof AppError ? error.statusCode : 400;
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      sendError(res, message, statusCode);
    }
  };
};
