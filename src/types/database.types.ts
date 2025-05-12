export interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
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
