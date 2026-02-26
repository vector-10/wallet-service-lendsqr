import { Router } from 'express';
import userRoutes from './user.routes';
import walletRoutes from './wallet.routes';

const router = Router();

router.use('/auth', userRoutes);
router.use('/wallet', walletRoutes);

export default router;