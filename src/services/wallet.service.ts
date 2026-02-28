import { Knex } from "knex";
import { Wallet, Transaction, UserRecord, FundWalletResult, TransferResult, WithdrawResult } from "../types";
import { generateReference } from "../utils";
import { NotFoundError, UnprocessableError, ValidationError } from "../utils/errors";
import db from "../config/database";

class WalletService {
  private async findWalletByUserId(userId: number): Promise<Wallet> {
    const wallet = await db("wallets").where({ user_id: userId }).first();
    if (!wallet) throw new NotFoundError("Wallet not found");
    return wallet;
  }

  private validateAmount(amount: number) {
    if (isNaN(amount) || amount <= 0) throw new ValidationError("Amount must be greater than zero");
  }

  private async recordTransaction(
    trx: Knex.Transaction,
    data: {
      source_wallet_id: number | null | undefined;
      destination_wallet_id: number | null | undefined;
      type: "fund" | "transfer" | "withdraw";
      amount: number;
      narration: string;
    },
  ) {
    const reference = generateReference();
    await trx("transactions").insert({ reference, ...data, status: "success" });
    return reference;
  }

  async fundWallet(userId: number, amount: number): Promise<FundWalletResult> {
    this.validateAmount(amount);
    const wallet = await this.findWalletByUserId(userId);

    return db.transaction(async (trx) => {
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

  async transferFunds(
    senderId: number,
    receiverEmail: string,
    amount: number,
  ): Promise<TransferResult> {
    this.validateAmount(amount);

    const receiver = await db<UserRecord>("users")
      .where({ email: receiverEmail })
      .first();
    if (!receiver) throw new NotFoundError("Receiver not found");
    if (receiver.id === senderId) throw new UnprocessableError("Cannot transfer to yourself");

    return db.transaction(async (trx) => {
     
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

      if (!senderWallet) throw new NotFoundError("Sender wallet not found");
      if (!receiverWallet) throw new NotFoundError("Receiver wallet not found");
      if (senderWallet.balance < amount) throw new UnprocessableError("Insufficient funds");

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

  async withdrawFunds(userId: number, amount: number): Promise<WithdrawResult> {
    this.validateAmount(amount);

    return db.transaction(async (trx) => {
      const wallet = await trx("wallets")
        .where({ user_id: userId })
        .forUpdate()
        .first();

      if (!wallet) throw new NotFoundError("Wallet not found");
      if (wallet.balance < amount) throw new UnprocessableError("Insufficient funds");

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

  async getWalletBalance(userId: number): Promise<Wallet> {
    return this.findWalletByUserId(userId);
  }

  async getTransactionHistory(userId: number): Promise<Transaction[]> {
    const wallet = await this.findWalletByUserId(userId);

    return db<Transaction>("transactions")
      .where({ source_wallet_id: wallet.id })
      .orWhere({ destination_wallet_id: wallet.id })
      .orderBy("created_at", "desc");
  }
}

export default new WalletService();
