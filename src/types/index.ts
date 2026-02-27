export interface User {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password_hash: string;
  status?: 'active' | 'blacklisted' | 'suspended';
  karma_checked_at?: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserRecord extends User {
  id: number;
}

export interface Wallet {
  id?: number;
  user_id: number;
  balance: number;
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