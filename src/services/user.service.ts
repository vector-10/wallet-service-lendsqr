import db from "../config/database";
import bcrypt from "bcryptjs";
import { encrypt, generateToken } from "../utils";
import adjutorService from "./adjutor.service";
import { User, UserRecord, Wallet } from "../types";

class UserService {
  private async findUserByEmail(
    email: string,
  ): Promise<UserRecord | undefined> {
    return db<UserRecord>("users").where({ email }).first();
  }

  private sanitizeUser(user: UserRecord): Omit<UserRecord, 'password_hash' | 'bvn' | 'karma_checked_at' | 'updated_at'> {
    const { password_hash, bvn, karma_checked_at, updated_at, ...safeUser } = user;
    return safeUser;
  }

  async register(data: {
  first_name: string;
  last_name: string;
  email: string;
  bvn: string;
  phone: string;
  password: string;
}): Promise<{ user: Partial<UserRecord>; token: string }> {
  const existing = await this.findUserByEmail(data.email);
  if (existing) throw new Error('Email already in use');

  const isBlackListed = await adjutorService.checkKarmaBlacklist(data.bvn);
  if (isBlackListed) throw new Error('Your identity has been flagged on the Lendsqr Karma blacklist. You cannot be onboarded.');

  const password_hash = await bcrypt.hash(data.password, 10);
  const encrypted_bvn = encrypt(data.bvn);

  const result = await db.transaction(async (trx) => {
    const [userId] = await trx<User>('users').insert({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      bvn: encrypted_bvn,
      phone: data.phone,
      password_hash,
      status: 'active',
      karma_checked_at: new Date(),
    });

    await trx<Wallet>('wallets').insert({
      user_id: userId,
      balance: 0.0,
      currency: 'NGN',
    });

    const user = await trx<UserRecord>('users').where({ id: userId }).first();

    if (!user) throw new Error('Failed to create account');

    const token = generateToken({ id: user.id, email: user.email });
    return { user: this.sanitizeUser(user), token };
  });

  return result;
}

  async login(data: {
    email: string;
    password: string;
  }): Promise<{ user: Partial<UserRecord>; token: string }> {
    const user = await this.findUserByEmail(data.email);
    if (!user) throw new Error("Invalid credentials");

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
