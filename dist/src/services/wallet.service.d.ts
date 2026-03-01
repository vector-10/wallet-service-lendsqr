import { Wallet, Transaction, FundWalletResult, TransferResult, WithdrawResult } from "../types";
declare class WalletService {
    private findWalletByUserId;
    private validateAmount;
    private recordTransaction;
    fundWallet(userId: number, amount: number): Promise<FundWalletResult>;
    transferFunds(senderId: number, receiverEmail: string, amount: number): Promise<TransferResult>;
    withdrawFunds(userId: number, amount: number): Promise<WithdrawResult>;
    getWalletBalance(userId: number): Promise<Wallet>;
    getTransactionHistory(userId: number): Promise<Transaction[]>;
}
declare const _default: WalletService;
export default _default;
//# sourceMappingURL=wallet.service.d.ts.map