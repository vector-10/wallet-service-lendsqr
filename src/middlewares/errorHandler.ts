import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils';
import { AppError } from '../utils/errors';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error(err.stack);
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  sendError(res, err.message || 'Internal server error', statusCode);
};