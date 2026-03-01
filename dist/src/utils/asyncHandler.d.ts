import { Request, Response, NextFunction } from 'express';
type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const asyncHandler: (fn: AsyncController) => AsyncController;
export {};
//# sourceMappingURL=asyncHandler.d.ts.map