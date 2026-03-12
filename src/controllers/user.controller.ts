import { Request, Response } from 'express';
import userService from '../services/user.service';
import { sendSuccess, asyncHandler } from '../utils';

class UserController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.register(req.body);
    sendSuccess(res, 'Account created successfully', result, 201);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.login(req.body);
    sendSuccess(res, 'Login successful', result);
  });
}

export default new UserController();
