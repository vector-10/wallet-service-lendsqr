import { Router } from 'express';
import userController from '../controllers/user.controller';
import { authLimiter } from '../middlewares/rateLimiter';

const router: Router = Router();

router.post('/register', authLimiter, userController.register);
router.post('/login', authLimiter, userController.login);

export default router;
