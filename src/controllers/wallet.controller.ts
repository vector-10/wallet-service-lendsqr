import { Request, Response } from 'express';
import walletService from '../services/wallet.service';
import { sendSuccess, sendError } from '../utils';

class WalletController {
  async fundWallet(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { amount } = req.body;

      if (!amount) {
        sendError(res, 'Amount is required', 400);
        return;
      }

      const result = await walletService.fundWallet(userId, Number(amount));
      sendSuccess(res, 'Wallet funded successfully', result);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async transfer(req: Request, res: Response): Promise<void> {
    try {
      const senderId = req.user!.id;
      const { receiver_email, amount } = req.body;

      if (!receiver_email || !amount) {
        sendError(res, 'Receiver email and amount are required', 400);
        return;
      }

      const result = await walletService.transferFunds(senderId, receiver_email, Number(amount));
      sendSuccess(res, 'Transfer successful', result);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async withdraw(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { amount } = req.body;

      if (!amount) {
        sendError(res, 'Amount is required', 400);
        return;
      }

      const result = await walletService.withdrawFunds(userId, Number(amount));
      sendSuccess(res, 'Withdrawal successful', result);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getBalance(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await walletService.getWalletBalance(userId);
      sendSuccess(res, 'Wallet balance retrieved', result);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await walletService.getTransactionHistory(userId);
      sendSuccess(res, 'Transaction history retrieved', result);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}

export default new WalletController();