export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  onboarded_at: Date | null;
  created_at: Date;
  updated_at: Date;
  preferences: object | null;
}

export interface User {
  id: string;
  email: string;
  role?: string;
}

export interface Trade {
  id: string;
  fromCurrency: string | null;
  toCurrency: string | null;
  amount: number | null;
  txHash: string | null;
  create_at: Date;
  walletAddress: string | null;
  profilesId: string;
}

export interface Transfer {
  id: string;
  fromWallet: string | null;
  toWallet: string | null;
  tokenName: string | null;
  tokenAddress: string | null;
  amount: number | null;
  txHash: string | null;
  create_at: Date;
  profilesId: string;
}

export interface Stake {
  id: string;
  userId: string;
  tokenName: string | null;
  tokenAddress: string | null;
  stakeAccount: string | null;
  validator: string | null;
  amount: number | null;
  status: string | null;
  walletAddress: string | null;
  txHash: string | null;
  create_at: Date;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>;
      };
    };
  };
}
