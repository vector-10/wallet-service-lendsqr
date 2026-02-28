import userService from "../services/user.service";
import adjutorService from "../services/adjutor.service";
import db from "../config/database";
import bcrypt from "bcryptjs";

jest.mock("../config/database");
jest.mock("../services/adjutor.service");
jest.mock("bcryptjs");

const mockedDb = db as jest.Mocked<typeof db>;
const mockedAdjutor = adjutorService as jest.Mocked<typeof adjutorService>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

const mockUser = {
  id: 1,
  first_name: "John",
  last_name: "Doe",
  email: "johndoe@gmail.com",
  phone: "+2348012345678",
  bvn: "encrypted_bvn",
  password_hash: "hashed_password",
  status: "active" as const,
  karma_checked_at: new Date(),
  created_at: new Date(),
  updated_at: new Date(),
};

const registerData = {
  first_name: "John",
  last_name: "Doe",
  email: "johndoe@gmail.com",
  phone: "+2348012345678",
  bvn: "22345678901",
  password: "password123",
};

describe("UserService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a user successfully", async () => {
      (mockedDb as any).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      });

      mockedAdjutor.checkKarmaBlacklist.mockResolvedValue(false);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");

      (mockedDb as any).transaction = jest
        .fn()
        .mockImplementation(async (cb: any) => {
          const trx: any = jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            insert: jest.fn().mockResolvedValue([1]),
            increment: jest.fn().mockResolvedValue(1),
            decrement: jest.fn().mockResolvedValue(1),
            select: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue(mockUser),
          });
          trx.where = jest.fn().mockReturnThis();
          trx.insert = jest.fn().mockResolvedValue([1]);
          return cb(trx);
        });

      const result = await userService.register(registerData);
      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("user");
    });

    it("should throw error if email already exists", async () => {
      (mockedDb as any).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(userService.register(registerData)).rejects.toThrow(
        "Email already in use",
      );
    });

    it("should throw error if user is blacklisted", async () => {
      (mockedDb as any).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      });

      mockedAdjutor.checkKarmaBlacklist.mockResolvedValue(true);

      await expect(userService.register(registerData)).rejects.toThrow(
        "Your identity has been flagged on the Lendsqr Karma blacklist. You cannot be onboarded.",
      );
    });
  });

  describe("login", () => {
    it("should login successfully with correct credentials", async () => {
      (mockedDb as any).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockUser),
      });

      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await userService.login({
        email: "johndoe@gmail.com",
        password: "password123",
      });

      expect(result).toHaveProperty("token");
      expect(result.user).not.toHaveProperty("password_hash");
      expect(result.user).not.toHaveProperty("bvn");
    });

    it("should throw error if user not found", async () => {
      (mockedDb as any).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      });

      await expect(
        userService.login({
          email: "wrong@gmail.com",
          password: "password123",
        }),
      ).rejects.toThrow("Invalid credentials");
    });

    it("should throw error if password is incorrect", async () => {
      (mockedDb as any).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockUser),
      });

      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        userService.login({
          email: "johndoe@gmail.com",
          password: "wrongpassword",
        }),
      ).rejects.toThrow("Invalid credentials");
    });

    it("should throw error if account is blacklisted", async () => {
      (mockedDb as any).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest
          .fn()
          .mockResolvedValue({ ...mockUser, status: "blacklisted" }),
      });

      await expect(
        userService.login({
          email: "johndoe@gmail.com",
          password: "password123",
        }),
      ).rejects.toThrow("Account is blacklisted");
    });
  });
});
