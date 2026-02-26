import { Router } from 'express';
import walletController from '../controllers/wallet.controller';
import { authenticate } from '../middlewares';

const router = Router();

router.use(authenticate);

router.get('/balance', walletController.getBalance.bind(walletController));
router.post('/fund', walletController.fundWallet.bind(walletController));
router.post('/transfer', walletController.transfer.bind(walletController));
router.post('/withdraw', walletController.withdraw.bind(walletController));
router.get('/transactions', walletController.getTransactions.bind(walletController));

export default router;