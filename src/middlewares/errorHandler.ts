import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(err.stack);
  sendError(res, err.message || 'Internal server error', 500);
};