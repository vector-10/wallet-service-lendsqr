import { Request, Response } from 'express';
import userService from '../services/user.service';
import { sendSuccess, sendError } from '../utils';

class UserController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { first_name, last_name, email, phone, password } = req.body;

      if (!first_name || !last_name || !email || !phone || !password) {
        sendError(res, 'All fields are required', 400);
        return;
      }

      const result = await userService.register({ first_name, last_name, email, phone, password });
      sendSuccess(res, 'Account created successfully', result, 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        sendError(res, 'Email and password are required', 400);
        return;
      }

      const result = await userService.login({ email, password });
      sendSuccess(res, 'Login successful', result);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}

export default new UserController();