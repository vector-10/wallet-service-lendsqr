import walletService from "../services/wallet.service";
import db from "../config/database";

jest.mock("../config/database");

const mockedDb = db as jest.Mocked<typeof db>;

const mockWallet = {
  id: 1,
  user_id: 1,
  balance: 5000,
  currency: "NGN",
  created_at: new Date(),
  updated_at: new Date(),
};

const mockReceiver = {
  id: 2,
  first_name: "Jane",
  last_name: "Doe",
  email: "receiver@gmail.com",
  phone: "+2348012345679",
  bvn: "encrypted_bvn",
  password_hash: "hashed_password",
  status: "active" as const,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockReceiverWallet = {
  id: 2,
  user_id: 2,
  balance: 1000,
  currency: "NGN",
  created_at: new Date(),
  updated_at: new Date(),
};

describe("WalletService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fundWallet", () => {
    it("should fund wallet successfully", async () => {
      const incrementMock = jest.fn().mockResolvedValue(1);
      const insertMock = jest.fn().mockResolvedValue([1]);
      const updatedWallet = { ...mockWallet, balance: mockWallet.balance + 5000 };

      (mockedDb as any).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockWallet),
      });

      (mockedDb as any).transaction = jest.fn().mockImplementation(async (cb: any) => {
        const trx: any = jest.fn().mockReturnValue({
          where: jest.fn().mockReturnThis(),
          increment: incrementMock,
          insert: insertMock,
          first: jest.fn().mockResolvedValue(updatedWallet),
        });
        trx.where = jest.fn().mockReturnThis();
        trx.insert = insertMock;
        return cb(trx);
      });

      const result = (await walletService.fundWallet(1, 5000)) as any;

      expect(result).toHaveProperty("reference");
      expect(incrementMock).toHaveBeenCalledWith("balance", 5000);
      expect(result.wallet.balance).toBe(mockWallet.balance + 5000);
    });

    it("should throw error if amount is zero or negative", async () => {
      await expect(walletService.fundWallet(1, 0)).rejects.toThrow(
        "Amount must be greater than zero",
      );
      await expect(walletService.fundWallet(1, -100)).rejects.toThrow(
        "Amount must be greater than zero",
      );
    });

    it("should throw error if wallet not found", async () => {
      (mockedDb as any).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      });

      await expect(walletService.fundWallet(1, 5000)).rejects.toThrow(
        "Wallet not found",
      );
    });
  });

  describe("transferFunds", () => {
    it("should transfer funds successfully", async () => {
      const decrementMock = jest.fn().mockResolvedValue(1);
      const incrementMock = jest.fn().mockResolvedValue(1);
      const insertMock = jest.fn().mockResolvedValue([1]);

      // First db call: receiver user lookup
      // Second db call: receiver wallet lookup
      (mockedDb as any)
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(mockReceiver),
        })
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(mockReceiverWallet),
        });

      (mockedDb as any).transaction = jest.fn().mockImplementation(async (cb: any) => {
        const trx: any = jest.fn().mockReturnValue({
          where: jest.fn().mockReturnThis(),
          forUpdate: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(mockWallet), // sender wallet, balance: 5000
          decrement: decrementMock,
          increment: incrementMock,
          insert: insertMock,
        });
        return cb(trx);
      });

      const result = (await walletService.transferFunds(1, "receiver@gmail.com", 1000)) as any;

      expect(result).toHaveProperty("reference");
      expect(result.amount).toBe(1000);
      expect(result.receiver).toBe("receiver@gmail.com");
      expect(decrementMock).toHaveBeenCalledWith("balance", 1000);
      expect(incrementMock).toHaveBeenCalledWith("balance", 1000);
    });

    it("should throw error if amount is zero or negative", async () => {
      await expect(
        walletService.transferFunds(1, "receiver@gmail.com", 0),
      ).rejects.toThrow("Amount must be greater than zero");
    });

    it("should throw error if receiver not found", async () => {
      (mockedDb as any).mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      });

      await expect(
        walletService.transferFunds(1, "unknown@gmail.com", 100),
      ).rejects.toThrow("Receiver not found");
    });

    it("should throw error if sender transfers to themselves", async () => {
      (mockedDb as any).mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ ...mockReceiver, id: 1 }), // same id as sender
      });

      await expect(
        walletService.transferFunds(1, "same@gmail.com", 100),
      ).rejects.toThrow("Cannot transfer to yourself");
    });

    it("should throw error if insufficient funds", async () => {
      (mockedDb as any)
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(mockReceiver),
        })
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(mockReceiverWallet),
        });

      (mockedDb as any).transaction = jest.fn().mockImplementation(async (cb: any) => {
        const trx: any = jest.fn().mockReturnValue({
          where: jest.fn().mockReturnThis(),
          forUpdate: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue({ ...mockWallet, balance: 100 }),
        });
        return cb(trx);
      });

      await expect(
        walletService.transferFunds(1, "receiver@gmail.com", 5000),
      ).rejects.toThrow("Insufficient funds");
    });
  });

  describe("withdrawFunds", () => {
    it("should withdraw successfully", async () => {
      const decrementMock = jest.fn().mockResolvedValue(1);
      const insertMock = jest.fn().mockResolvedValue([1]);
      const updatedWallet = { ...mockWallet, balance: 4500 };

      (mockedDb as any).transaction = jest.fn().mockImplementation(async (cb: any) => {
        const trx: any = jest.fn().mockReturnValue({
          where: jest.fn().mockReturnThis(),
          forUpdate: jest.fn().mockReturnThis(),
          first: jest.fn()
            .mockResolvedValueOnce(mockWallet)    // locked wallet read
            .mockResolvedValueOnce(updatedWallet), // updated wallet after decrement
          decrement: decrementMock,
          insert: insertMock,
        });
        return cb(trx);
      });

      const result = (await walletService.withdrawFunds(1, 500)) as any;

      expect(result).toHaveProperty("reference");
      expect(decrementMock).toHaveBeenCalledWith("balance", 500);
      expect(result.wallet.balance).toBe(4500);
    });

    it("should throw error if amount is zero or negative", async () => {
      await expect(walletService.withdrawFunds(1, 0)).rejects.toThrow(
        "Amount must be greater than zero",
      );
    });

    it("should throw error if wallet not found", async () => {
      (mockedDb as any).transaction = jest.fn().mockImplementation(async (cb: any) => {
        const trx: any = jest.fn().mockReturnValue({
          where: jest.fn().mockReturnThis(),
          forUpdate: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(null),
        });
        return cb(trx);
      });

      await expect(walletService.withdrawFunds(1, 500)).rejects.toThrow(
        "Wallet not found",
      );
    });

    it("should throw error if insufficient funds", async () => {
      (mockedDb as any).transaction = jest.fn().mockImplementation(async (cb: any) => {
        const trx: any = jest.fn().mockReturnValue({
          where: jest.fn().mockReturnThis(),
          forUpdate: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue({ ...mockWallet, balance: 100 }),
        });
        return cb(trx);
      });

      await expect(walletService.withdrawFunds(1, 5000)).rejects.toThrow(
        "Insufficient funds",
      );
    });
  });

  describe("getWalletBalance", () => {
    it("should return wallet balance successfully", async () => {
      (mockedDb as any).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockWallet),
      });

      const result = await walletService.getWalletBalance(1);
      expect(result).toEqual(mockWallet);
    });

    it("should throw error if wallet not found", async () => {
      (mockedDb as any).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      });

      await expect(walletService.getWalletBalance(1)).rejects.toThrow(
        "Wallet not found",
      );
    });
  });

  describe("getTransactionHistory", () => {
    it("should return transaction history successfully", async () => {
      const mockTransactions = [
        {
          id: 1,
          reference: "TXN-1",
          type: "fund",
          amount: 5000,
          status: "success",
          source_wallet_id: null,
          destination_wallet_id: 1,
          created_at: new Date(),
        },
        {
          id: 2,
          reference: "TXN-2",
          type: "withdraw",
          amount: 500,
          status: "success",
          source_wallet_id: 1,
          destination_wallet_id: null,
          created_at: new Date(),
        },
      ];

      (mockedDb as any)
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(mockWallet),
        })
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          orWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockResolvedValue(mockTransactions),
        });

      const result = await walletService.getTransactionHistory(1);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("reference");
    });

    it("should throw error if wallet not found", async () => {
      (mockedDb as any).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      });

      await expect(walletService.getTransactionHistory(1)).rejects.toThrow(
        "Wallet not found",
      );
    });
  });
});
