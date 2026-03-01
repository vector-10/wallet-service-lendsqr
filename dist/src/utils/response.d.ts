import { Response } from 'express';
export declare const sendSuccess: <T>(res: Response, message: string, data?: T, statusCode?: number) => Response<any, Record<string, any>>;
export declare const sendError: (res: Response, message: string, statusCode?: number) => Response<any, Record<string, any>>;
//# sourceMappingURL=response.d.ts.map