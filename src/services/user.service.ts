import db from "../config/database";
import bcrypt from "bcryptjs";
import {
  encrypt,
  generateToken,
  generateAccountNumber,
  generateRefreshToken,
} from "../utils";
import {
  AppError,
  ConflictError,
  ForbiddenError,
  UnprocessableError,
  ValidationError,
} from "../utils/errors";
import adjutorService from "./adjutor.service";
import tokenService from "./token.service";
import {
  User,
  UserRecord,
  Wallet,
  RegisterInput,
  LoginInput,
  SafeUser,
  AuthResult,
} from "../types";

class UserService {
  private async findUserByEmail(
    email: string,
  ): Promise<UserRecord | undefined> {
    return db<UserRecord>("users").where({ email }).first();
  }

  private sanitizeUser(user: UserRecord): SafeUser {
    const { password_hash, bvn, karma_checked_at, updated_at, ...safeUser } =
      user;
    return safeUser;
  }

  async register(data: RegisterInput): Promise<AuthResult> {
    const existing = await this.findUserByEmail(data.email);
    if (existing) throw new ConflictError("Email already in use");

    const isBlackListed = await adjutorService.checkKarmaBlacklist(data.bvn);
    if (isBlackListed)
      throw new UnprocessableError(
        "Your identity has been flagged on the Lendsqr Karma blacklist. You cannot be onboarded.",
      );

    const password_hash = await bcrypt.hash(data.password, 10);
    const encrypted_bvn = encrypt(data.bvn);

    const result = await db.transaction(async (trx) => {
      const [userId] = await trx<User>("users").insert({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        bvn: encrypted_bvn,
        phone: data.phone,
        password_hash,
        status: "active",
        karma_checked_at: new Date(),
      });

      const account_number = await generateAccountNumber(trx);
      await trx<Wallet>("wallets").insert({
        user_id: userId,
        balance: 0.0,
        currency: "NGN",
        account_number,
      });

      const user = await trx<UserRecord>("users").where({ id: userId }).first();

      if (!user) throw new AppError("Failed to create account", 500);

      const access_token = generateToken({ id: user.id, email: user.email });
      const refresh_token = generateRefreshToken({
        id: user.id,
        email: user.email,
      });
      await tokenService.saveRefreshToken(user.id, refresh_token);
      return { user: this.sanitizeUser(user), access_token, refresh_token };
    });

    return result;
  }

  async login(data: LoginInput): Promise<AuthResult> {
    const user = await this.findUserByEmail(data.email);
    if (!user) throw new ValidationError("Invalid credentials");

    if (user.status === "blacklisted")
      throw new ForbiddenError("Account is blacklisted");
    if (user.status === "suspended")
      throw new ForbiddenError("Account is suspended");

    const isMatch = await bcrypt.compare(data.password, user.password_hash);
    if (!isMatch) throw new ValidationError("Invalid credentials");

    const access_token = generateToken({ id: user.id, email: user.email });
    const refresh_token = generateRefreshToken({
      id: user.id,
      email: user.email,
    });
    await tokenService.saveRefreshToken(user.id, refresh_token);

    return { user: this.sanitizeUser(user), access_token, refresh_token };
  }
}

export default new UserService();
