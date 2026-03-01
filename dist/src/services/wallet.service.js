"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const errors_1 = require("../utils/errors");
const database_1 = __importDefault(require("../config/database"));
class WalletService {
    async findWalletByUserId(userId) {
        const wallet = await (0, database_1.default)("wallets").where({ user_id: userId }).first();
        if (!wallet)
            throw new errors_1.NotFoundError("Wallet not found");
        return wallet;
    }
    validateAmount(amount) {
        if (isNaN(amount) || amount <= 0)
            throw new errors_1.ValidationError("Amount must be greater than zero");
    }
    async recordTransaction(trx, data) {
        const reference = (0, utils_1.generateReference)();
        await trx("transactions").insert({ reference, ...data, status: "success" });
        return reference;
    }
    async fundWallet(userId, amount) {
        this.validateAmount(amount);
        const wallet = await this.findWalletByUserId(userId);
        return database_1.default.transaction(async (trx) => {
            await trx("wallets")
                .where({ id: wallet.id })
                .increment("balance", amount);
            const reference = await this.recordTransaction(trx, {
                source_wallet_id: null,
                destination_wallet_id: wallet.id,
                type: "fund",
                amount,
                narration: `Wallet Funded with NGN ${amount}`,
            });
            const updatedWallet = await trx("wallets")
                .where({ id: wallet.id })
                .first();
            return { wallet: updatedWallet, reference };
        });
    }
    async transferFunds(senderId, receiverEmail, amount) {
        this.validateAmount(amount);
        const receiver = await (0, database_1.default)("users")
            .where({ email: receiverEmail })
            .first();
        if (!receiver)
            throw new errors_1.NotFoundError("Receiver not found");
        if (receiver.id === senderId)
            throw new errors_1.UnprocessableError("Cannot transfer to yourself");
        return database_1.default.transaction(async (trx) => {
            const [firstUserId, secondUserId] = [senderId, receiver.id].sort((a, b) => a - b);
            const firstWallet = await trx("wallets")
                .where({ user_id: firstUserId })
                .forUpdate()
                .first();
            const secondWallet = await trx("wallets")
                .where({ user_id: secondUserId })
                .forUpdate()
                .first();
            const senderWallet = firstUserId === senderId ? firstWallet : secondWallet;
            const receiverWallet = firstUserId === senderId ? secondWallet : firstWallet;
            if (!senderWallet)
                throw new errors_1.NotFoundError("Sender wallet not found");
            if (!receiverWallet)
                throw new errors_1.NotFoundError("Receiver wallet not found");
            const senderMinimum = senderWallet.minimum_balance ?? 100;
            if (senderWallet.balance - amount < senderMinimum) {
                throw new errors_1.UnprocessableError(`Insufficient funds. A minimum balance of NGN ${senderMinimum} must be maintained.`);
            }
            await trx("wallets")
                .where({ id: senderWallet.id })
                .decrement("balance", amount);
            await trx("wallets")
                .where({ id: receiverWallet.id })
                .increment("balance", amount);
            const reference = await this.recordTransaction(trx, {
                source_wallet_id: senderWallet.id,
                destination_wallet_id: receiverWallet.id,
                type: "transfer",
                amount,
                narration: `Transfer of NGN ${amount} to ${receiverEmail}`,
            });
            return { reference, amount, receiver: receiverEmail };
        });
    }
    async withdrawFunds(userId, amount) {
        this.validateAmount(amount);
        return database_1.default.transaction(async (trx) => {
            const wallet = await trx("wallets")
                .where({ user_id: userId })
                .forUpdate()
                .first();
            if (!wallet)
                throw new errors_1.NotFoundError("Wallet not found");
            const minimum = wallet.minimum_balance ?? 100;
            if (wallet.balance - amount < minimum) {
                throw new errors_1.UnprocessableError(`Insufficient funds. A minimum balance of NGN ${minimum} must be maintained.`);
            }
            await trx("wallets")
                .where({ id: wallet.id })
                .decrement("balance", amount);
            const reference = await this.recordTransaction(trx, {
                source_wallet_id: wallet.id,
                destination_wallet_id: null,
                type: "withdraw",
                amount,
                narration: `Withdrawal of NGN ${amount}`,
            });
            const updatedWallet = await trx("wallets")
                .where({ id: wallet.id })
                .first();
            return { wallet: updatedWallet, reference };
        });
    }
    async getWalletBalance(userId) {
        return this.findWalletByUserId(userId);
    }
    async getTransactionHistory(userId) {
        const wallet = await this.findWalletByUserId(userId);
        return (0, database_1.default)("transactions")
            .where({ source_wallet_id: wallet.id })
            .orWhere({ destination_wallet_id: wallet.id })
            .orderBy("created_at", "desc");
    }
}
exports.default = new WalletService();
//# sourceMappingURL=wallet.service.js.map