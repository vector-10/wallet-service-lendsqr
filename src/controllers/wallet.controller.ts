import { Request, Response } from "express";
import walletService from "../services/wallet.service";
import { sendSuccess, asyncHandler } from "../utils";

class WalletController {
  fundWallet = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { amount } = req.body;
    const result = await walletService.fundWallet(userId, amount);
    sendSuccess(res, "Wallet funded successfully", result);
  });

  transfer = asyncHandler(async (req: Request, res: Response) => {
    const senderId = req.user!.id;
    const { receiver_account_number, amount } = req.body;
    const result = await walletService.transferFunds(
      senderId,
      receiver_account_number,
      amount,
    );
    sendSuccess(res, "Transfer successful", result);
  });

  withdraw = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { amount } = req.body;
    const result = await walletService.withdrawFunds(userId, amount);
    sendSuccess(res, "Withdrawal successful", result);
  });

  getBalance = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await walletService.getWalletBalance(userId);
    sendSuccess(res, "Wallet balance retrieved", result);
  });

  getTransactions = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await walletService.getTransactionHistory(userId);
    sendSuccess(res, "Transaction history retrieved", result);
  });
}

export default new WalletController();
