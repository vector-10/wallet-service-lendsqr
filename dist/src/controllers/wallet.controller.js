"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wallet_service_1 = __importDefault(require("../services/wallet.service"));
const utils_1 = require("../utils");
class WalletController {
    constructor() {
        this.fundWallet = (0, utils_1.asyncHandler)(async (req, res) => {
            const userId = req.user.id;
            const { amount } = req.body;
            const parsedAmount = Number(amount);
            if (amount === undefined || amount === null || isNaN(parsedAmount) || parsedAmount <= 0) {
                (0, utils_1.sendError)(res, 'Amount must be a positive number', 400);
                return;
            }
            const result = await wallet_service_1.default.fundWallet(userId, parsedAmount);
            (0, utils_1.sendSuccess)(res, 'Wallet funded successfully', result);
        });
        this.transfer = (0, utils_1.asyncHandler)(async (req, res) => {
            const senderId = req.user.id;
            const { receiver_email, amount } = req.body;
            const parsedAmount = Number(amount);
            if (!receiver_email || amount === undefined || amount === null || isNaN(parsedAmount) || parsedAmount <= 0) {
                (0, utils_1.sendError)(res, 'Receiver email and a positive amount are required', 400);
                return;
            }
            const result = await wallet_service_1.default.transferFunds(senderId, receiver_email, parsedAmount);
            (0, utils_1.sendSuccess)(res, 'Transfer successful', result);
        });
        this.withdraw = (0, utils_1.asyncHandler)(async (req, res) => {
            const userId = req.user.id;
            const { amount } = req.body;
            const parsedAmount = Number(amount);
            if (amount === undefined || amount === null || isNaN(parsedAmount) || parsedAmount <= 0) {
                (0, utils_1.sendError)(res, 'Amount must be a positive number', 400);
                return;
            }
            const result = await wallet_service_1.default.withdrawFunds(userId, parsedAmount);
            (0, utils_1.sendSuccess)(res, 'Withdrawal successful', result);
        });
        this.getBalance = (0, utils_1.asyncHandler)(async (req, res) => {
            const userId = req.user.id;
            const result = await wallet_service_1.default.getWalletBalance(userId);
            (0, utils_1.sendSuccess)(res, 'Wallet balance retrieved', result);
        });
        this.getTransactions = (0, utils_1.asyncHandler)(async (req, res) => {
            const userId = req.user.id;
            const result = await wallet_service_1.default.getTransactionHistory(userId);
            (0, utils_1.sendSuccess)(res, 'Transaction history retrieved', result);
        });
    }
}
exports.default = new WalletController();
//# sourceMappingURL=wallet.controller.js.map