import { Router } from 'express';
import userController from '../controllers/user.controller';
import tokenController from '../controllers/token.controller';
import { authLimiter } from '../middlewares/rateLimiter';
import { validateBody } from '../middlewares/validate';
import { RegisterSchema, LoginSchema, RefreshTokenSchema } from '../validators/auth.validator';

const router: Router = Router();

router.post('/register', authLimiter, validateBody(RegisterSchema), userController.register);
router.post('/login', authLimiter, validateBody(LoginSchema), userController.login);
router.post('/refresh', validateBody(RefreshTokenSchema), tokenController.refresh);
router.post('/logout', validateBody(RefreshTokenSchema), tokenController.logout);

export default router;
