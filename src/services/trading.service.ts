import {
  mockExchangeRates,
  mockRules,
  mockTransactions,
  mockWallet,
  Rule,
  Transaction,
} from "../utils/mock";

const store = {
  wallet: mockWallet,
  exchangeRates: mockExchangeRates,
  transactions: mockTransactions,
  rules: mockRules,
};

export const addTransaction = (transaction: Transaction) => {
  store.transactions.push({
    ...transaction,
    id: (store.transactions.length + 1).toString(),
    transactionDate: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    transactionStatus: "pending",
    transactionHash: "0x1234567890abcdef",
    type: "user",
  });

  store.wallet.balance = store.wallet.balance.map((b) => {
    if (b.currency === transaction.fromCurrency) {
      return {
        ...b,
        amount: b.amount - transaction.fromAmount,
      };
    }

    if (b.currency === transaction.toCurrency) {
      return {
        ...b,
        amount: b.amount + transaction.toAmount,
      };
    }

    return b;
  });
};

export const addRule = (rule: Rule) => {
  store.rules.push({
    ...rule,
    id: (store.rules.length + 1).toString(),
    created_at: new Date(),
    updated_at: new Date(),
    status: "active",
  });
};

export const toggleRule = (ruleId: string) => {
  store.rules = store.rules.map((r) =>
    r.id === ruleId
      ? { ...r, status: r.status === "active" ? "inactive" : "active" }
      : r
  );
};

export const deleteRule = (ruleId: string) => {
  store.rules = store.rules.filter((r) => r.id !== ruleId);
};
