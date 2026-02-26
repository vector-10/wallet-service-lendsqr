import { Router } from 'express';
import userController from '../controllers/user.controller';

const router = Router();

router.post('/register', userController.register.bind(userController));
router.post('/login', userController.login.bind(userController));

export default router;