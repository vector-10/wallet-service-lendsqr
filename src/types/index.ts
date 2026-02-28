export interface User {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  bvn: string;
  phone: string;
  password_hash: string;
  status?: 'active' | 'blacklisted' | 'suspended';
  karma_checked_at?: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserRecord extends User {
  id: number;
  status: 'active' | 'blacklisted' | 'suspended';
  karma_checked_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export type SafeUser = Omit<UserRecord, 'password_hash' | 'bvn' | 'karma_checked_at' | 'updated_at'>;

export interface RegisterInput {
  first_name: string;
  last_name: string;
  email: string;
  bvn: string;
  phone: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface Wallet {
  id?: number;
  user_id: number;
  balance: number;
  minimum_balance?: number;
  currency?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Transaction {
  id?: number;
  reference: string;
  source_wallet_id?: number | null;
  destination_wallet_id?: number | null;
  type: 'fund' | 'transfer' | 'withdraw';
  amount: number;
  status?: 'pending' | 'success' | 'failed';
  narration?: string | null;
  created_at?: Date;
}

export interface AuthPayload {
  id: number;
  email: string;
}

export interface FundWalletResult {
  wallet: Wallet;
  reference: string;
}

export interface TransferResult {
  reference: string;
  amount: number;
  receiver: string;
}

export interface WithdrawResult {
  wallet: Wallet;
  reference: string;
}

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data?: T;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}