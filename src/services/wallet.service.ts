import { Wallet, Transaction, User, FundWalletResult, TransferResult, WithdrawResult } from "../types";
import { generateReference } from "../utils";
import db from "../config/database";

class WalletService {
  private async findWalletByUserId(userId: number): Promise<Wallet> {
    const wallet = await db("wallets").where({ user_id: userId }).first();
    if (!wallet) throw new Error("Wallet not found");
    return wallet;
  }

  private validateAmount(amount: number) {
    if (amount <= 0) throw new Error("Amount must be greater than zero");
  }

  private async recordTransaction(
    trx: any,
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

    const receiver = await db<User>("users")
      .where({ email: receiverEmail })
      .first();
    if (!receiver) throw new Error("Receiver not found");
    if (receiver.id === senderId)
      throw new Error("Cannot transfer to yourself");

    const receiverWallet = await db<Wallet>("wallets")
      .where({ user_id: receiver.id })
      .first();
    if (!receiverWallet) throw new Error("Receiver wallet not found");

    return db.transaction(async (trx) => {
      const senderWallet = await trx("wallets")
        .where({ user_id: senderId })
        .forUpdate()
        .first();

      if (!senderWallet) throw new Error("Wallet not found");
      if (senderWallet.balance < amount) throw new Error("Insufficient funds");

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

      if (!wallet) throw new Error("Wallet not found");
      if (wallet.balance < amount) throw new Error("Insufficient funds");

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
