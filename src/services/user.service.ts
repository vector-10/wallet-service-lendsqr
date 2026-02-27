import db from "../config/database";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils";
import adjutorService from "./adjutor.service";
import { User, UserRecord, Wallet } from "../types";

class UserService {
  private async findUserByEmail(email: string): Promise<UserRecord | undefined> {
    return db<UserRecord>("users").where({ email }).first();
  }

  private sanitizeUser(user: User) {
    const { password_hash, ...safeUser } = user as any;
    return safeUser;
  }

  async register(data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<{ user: Partial<UserRecord>; token: string }> {
    const existing = await this.findUserByEmail(data.email);
    if (existing) throw new Error("Email already in use");

    const isBlackListed = await adjutorService.checkKarmaBlacklist(data.email);
    if (isBlackListed)
      throw new Error("User is blacklisted and cannot be registered");

    const password_hash = await bcrypt.hash(data.password, 10);

    const user = await db.transaction(async (trx) => {
      const [userId] = await trx<User>("users").insert({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        password_hash,
        status: "active",
        karma_checked_at: new Date(),
      });

      await trx<Wallet>("wallets").insert({
        user_id: userId,
        balance: 0.0,
        currency: "NGN",
      });

      return trx<UserRecord>("users")
        .where({ id: userId })
        .select(
          "id",
          "first_name",
          "last_name",
          "email",
          "phone",
          "status",
          "created_at",
        )
        .first();
    });
    if (!user) throw new Error("Failed to create account");

    const token = generateToken({ id: user.id, email: user.email });
    return { user, token };
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<{ user: Partial<UserRecord>; token: string }> {
    const user = await this.findUserByEmail(data.email);
    if (!user) throw new Error("Invalid Credentials");

    if (user.status === "blacklisted")
      throw new Error("Account is blacklisted");
    if (user.status === "suspended") throw new Error("Account is suspended");

    const isMatch = await bcrypt.compare(data.password, user.password_hash);
    if (!isMatch) throw new Error("Invalid credentials");

    const token = generateToken({ id: user.id, email: user.email });
    return { user: this.sanitizeUser(user), token };
  }
}

export default new UserService();
