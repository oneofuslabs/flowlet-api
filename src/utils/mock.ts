export const mockWallet = {
  address: "0x4f3C6b6F54eA215D24C36d4f3B6D80D50E9fE6a8",
  privateKey:
    "0x9b5e19fc2dd8f486b213768e245c70571e9bcb5b6c1ab38ea2f439d210b7262a",
  balance: [
    {
      currency: "ETH",
      amount: 0.02,
    },
    {
      currency: "BTC",
      amount: 0.0001,
    },
    {
      currency: "SOL",
      amount: 10,
    },
    {
      currency: "USDT",
      amount: 100,
    },
  ],
};

export const mockExchangeRates = {
  ETH: 0.00043,
  BTC: 0.0000097,
  SOL: 0.0058,
  USDT: 1,
};

type Transaction = {
  id: string;
  fromAmount: number;
  fromCurrency: string;
  toCurrency: string;
  toAmount: number;
  transactionDate: Date;
  transactionStatus: string;
  transactionHash: string;
  type: "user" | "rule";
  ruleId?: string;
};

export const mockTransactions: Transaction[] = [
  {
    id: "1",
    fromAmount: 100,
    fromCurrency: "ETH",
    toCurrency: "USDT",
    toAmount: 100 * (mockExchangeRates.USDT / mockExchangeRates.ETH),
    transactionDate: new Date("2025-01-01"),
    transactionStatus: "pending",
    transactionHash: "0x1234567890abcdef",
    type: "user",
  },
  {
    id: "2",
    fromAmount: 40,
    fromCurrency: "USDT",
    toCurrency: "BTC",
    toAmount: 40 * (mockExchangeRates.BTC / mockExchangeRates.USDT),
    transactionDate: new Date("2025-01-01"),
    transactionStatus: "pending",
    transactionHash: "0x1234567890abcdef",
    type: "user",
  },
  {
    id: "3",
    fromAmount: 1,
    fromCurrency: "SOL",
    toCurrency: "ETH",
    toAmount: 1 * (mockExchangeRates.ETH / mockExchangeRates.SOL),
    transactionDate: new Date("2025-01-01"),
    transactionStatus: "pending",
    transactionHash: "0x1234567890abcdef",
    type: "rule",
    ruleId: "1",
  },
];

export type Rule = {
  ruleId: string;
  fromCurrency: string;
  fromAmount: number;
  toCurrency?: string;
  // For recurring rules
  toWalletAddress?: string;
  frequency?: "daily" | "weekly" | "monthly" | "yearly";
  // For trading rules
  threshold?: number;
  thresholdDirection?: "above" | "below";
  status: "active" | "inactive";
  startDate?: Date;
  endDate?: Date;
  created_at: Date;
  updated_at: Date;
};

export const mockRules = [
  {
    id: "1",
    name: "Buy ETH",
    description: "Buy ETH when the price is below 0.00038",
    fromCurrency: "USDT",
    fromAmount: 100,
    toCurrency: "ETH",
    threshold: 0.00038,
    active: true,
    thresholdDirection: "below",
  },
  {
    id: "2",
    name: "Sell ETH",
    description: "Sell ETH when the price is above 0.00046",
    fromCurrency: "ETH",
    fromAmount: 100,
    toCurrency: "USDT",
    threshold: 0.00046,
    active: true,
    thresholdDirection: "above",
  },
  {
    id: 3,
    name: "Weekly transfer to Mom",
    description: "Transfer 100 USDT to Mom every week",
    fromCurrency: "USDT",
    fromAmount: 100,
    toWalletAddress: "0x1234567890abcdef",
    frequency: "weekly",
    status: "active",
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-31"),
  },
];
