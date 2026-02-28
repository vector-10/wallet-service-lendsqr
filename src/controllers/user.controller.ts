import { Request, Response } from 'express';
import userService from '../services/user.service';
import { sendSuccess, sendError, asyncHandler } from '../utils';

class UserController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const { first_name, last_name, email, bvn, phone, password } = req.body;

    if (!first_name || !last_name || !email || !bvn || !phone || !password) {
      sendError(res, 'All fields are required', 400);
      return;
    }

    const result = await userService.register({ first_name, last_name, email, bvn, phone, password });
    sendSuccess(res, 'Account created successfully', result, 201);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, 'Email and password are required', 400);
      return;
    }

    const result = await userService.login({ email, password });
    sendSuccess(res, 'Login successful', result);
  });
}

export default new UserController();
