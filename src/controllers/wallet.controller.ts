import { Request, Response } from 'express';
import walletService from '../services/wallet.service';
import { sendSuccess, sendError, asyncHandler } from '../utils';

class WalletController {
  fundWallet = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { amount } = req.body;
    const parsedAmount = Number(amount);

    if (amount === undefined || amount === null || isNaN(parsedAmount) || parsedAmount <= 0) {
      sendError(res, 'Amount must be a positive number', 400);
      return;
    }

    const result = await walletService.fundWallet(userId, parsedAmount);
    sendSuccess(res, 'Wallet funded successfully', result);
  });

  transfer = asyncHandler(async (req: Request, res: Response) => {
    const senderId = req.user!.id;
    const { receiver_email, amount } = req.body;
    const parsedAmount = Number(amount);

    if (!receiver_email || amount === undefined || amount === null || isNaN(parsedAmount) || parsedAmount <= 0) {
      sendError(res, 'Receiver email and a positive amount are required', 400);
      return;
    }

    const result = await walletService.transferFunds(senderId, receiver_email, parsedAmount);
    sendSuccess(res, 'Transfer successful', result);
  });

  withdraw = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { amount } = req.body;
    const parsedAmount = Number(amount);

    if (amount === undefined || amount === null || isNaN(parsedAmount) || parsedAmount <= 0) {
      sendError(res, 'Amount must be a positive number', 400);
      return;
    }

    const result = await walletService.withdrawFunds(userId, parsedAmount);
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
