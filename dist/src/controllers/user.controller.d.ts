import { Request, Response } from 'express';
declare class UserController {
    register: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    login: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
}
declare const _default: UserController;
export default _default;
//# sourceMappingURL=user.controller.d.ts.map