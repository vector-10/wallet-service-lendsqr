import { Request, Response } from 'express';
declare class WalletController {
    fundWallet: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    transfer: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    withdraw: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getBalance: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getTransactions: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
}
declare const _default: WalletController;
export default _default;
//# sourceMappingURL=wallet.controller.d.ts.map