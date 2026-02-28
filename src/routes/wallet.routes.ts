import { Router } from 'express';
import walletController from '../controllers/wallet.controller';
import { authenticate } from '../middlewares';

const router: Router = Router();

router.use(authenticate);

router.get('/balance', walletController.getBalance);
router.post('/fund', walletController.fundWallet);
router.post('/transfer', walletController.transfer);
router.post('/withdraw', walletController.withdraw);
router.get('/transactions', walletController.getTransactions);

export default router;
