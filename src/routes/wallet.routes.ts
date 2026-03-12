import { Router } from 'express';
import walletController from '../controllers/wallet.controller';
import { authenticate, validateBody, idempotency } from '../middlewares';
import { FundWalletSchema, TransferSchema, WithdrawSchema } from '../validators/wallet.validator';
        
const router: Router = Router();
router.use(authenticate);

router.get('/balance', walletController.getBalance);
router.post('/fund', idempotency, validateBody(FundWalletSchema), walletController.fundWallet);
router.post('/transfer', idempotency, validateBody(TransferSchema), walletController.transfer);
router.post('/withdraw', idempotency, validateBody(WithdrawSchema), walletController.withdraw);
router.get('/transactions', walletController.getTransactions);

export default router;