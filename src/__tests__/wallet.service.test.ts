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

describe("WalletService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fundWallet", () => {
    it("should fund wallet successfully", async () => {
      const incrementMock = jest.fn().mockResolvedValue(1);
      const insertMock = jest.fn().mockResolvedValue([1]);
      const updatedWallet = {
        ...mockWallet,
        balance: mockWallet.balance + 5000,
      };

      (mockedDb as any).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockWallet),
      });

      (mockedDb as any).transaction = jest
        .fn()
        .mockImplementation(async (cb: any) => {
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
    it("should throw error if insufficient funds", async () => {
      (mockedDb as any).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ ...mockWallet, balance: 100 }),
      });

      await expect(
        walletService.transferFunds(1, "receiver@gmail.com", 5000),
      ).rejects.toThrow("Insufficient funds");
    });

    it("should throw error if amount is zero or negative", async () => {
      await expect(
        walletService.transferFunds(1, "receiver@gmail.com", 0),
      ).rejects.toThrow("Amount must be greater than zero");
    });

    it("should throw error if receiver not found", async () => {
      (mockedDb as any)
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(mockWallet),
        })
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(null),
        });

      await expect(
        walletService.transferFunds(1, "unknown@gmail.com", 100),
      ).rejects.toThrow("Receiver not found");
    });

    it("should throw error if sender transfers to themselves", async () => {
      (mockedDb as any)
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(mockWallet),
        })
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          first: jest
            .fn()
            .mockResolvedValue({ id: 1, email: "same@gmail.com" }),
        });

      await expect(
        walletService.transferFunds(1, "same@gmail.com", 100),
      ).rejects.toThrow("Cannot transfer to yourself");
    });
  });

  describe("withdrawFunds", () => {
    it("should throw error if insufficient funds", async () => {
      (mockedDb as any).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ ...mockWallet, balance: 100 }),
      });

      await expect(walletService.withdrawFunds(1, 5000)).rejects.toThrow(
        "Insufficient funds",
      );
    });

    it("should throw error if amount is zero or negative", async () => {
      await expect(walletService.withdrawFunds(1, 0)).rejects.toThrow(
        "Amount must be greater than zero",
      );
    });

    it("should throw error if wallet not found", async () => {
      (mockedDb as any).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      });

      await expect(walletService.withdrawFunds(1, 500)).rejects.toThrow(
        "Wallet not found",
      );
    });
  });
});
