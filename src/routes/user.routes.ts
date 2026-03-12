import { Router } from 'express';
import userController from '../controllers/user.controller';
import { authLimiter } from '../middlewares/rateLimiter';
import { validateBody } from '../middlewares/validate';
import { RegisterSchema, LoginSchema } from '../validators/auth.validator';

const router: Router = Router();

router.post('/register', authLimiter, validateBody(RegisterSchema), userController.register);
router.post('/login', authLimiter, validateBody(LoginSchema), userController.login);

export default router;
