import { Request, Response } from 'express';
import walletService from '../services/wallet.service';
import { sendSuccess, sendError, asyncHandler } from '../utils';

class WalletController {
  fundWallet = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { amount } = req.body;

    if (!amount) {
      sendError(res, 'Amount is required', 400);
      return;
    }

    const result = await walletService.fundWallet(userId, Number(amount));
    sendSuccess(res, 'Wallet funded successfully', result);
  });

  transfer = asyncHandler(async (req: Request, res: Response) => {
    const senderId = req.user!.id;
    const { receiver_email, amount } = req.body;

    if (!receiver_email || !amount) {
      sendError(res, 'Receiver email and amount are required', 400);
      return;
    }

    const result = await walletService.transferFunds(senderId, receiver_email, Number(amount));
    sendSuccess(res, 'Transfer successful', result);
  });

  withdraw = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { amount } = req.body;

    if (!amount) {
      sendError(res, 'Amount is required', 400);
      return;
    }

    const result = await walletService.withdrawFunds(userId, Number(amount));
    sendSuccess(res, 'Withdrawal successful', result);
  });

  getBalance = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await walletService.getWalletBalance(userId);
    sendSuccess(res, 'Wallet balance retrieved', result);
  });

  getTransactions = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await walletService.getTransactionHistory(userId);
    sendSuccess(res, 'Transaction history retrieved', result);
  });
}

export default new WalletController();
