import { Response, Router } from "express";
import {
  AuthenticatedRequest,
  authMiddleware,
} from "../middlewares/auth.middleware";
import { Profile } from "../types/database.types";
import { getUserProfile, updateUserProfile } from "../services/user.service";
import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { getWalletByUserId } from "../services/wallet.service";
import { getAllTransactions } from "../services/transaction.service";
import { getRates } from "../services/rates.service";

const router = Router();

// All routes are protected by authentication
router.use(authMiddleware);

// GET /api/v1/users/profile - Get user profile
router.get("/profile", async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { data, error } = await getUserProfile(req.user.id);

    if (error) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ message: "Server error fetching profile" });
  }
});

// GET /api/v1/users/config - Get wallet, rules, transactions, and exchange rates
router.get("/config", async (
  req: AuthenticatedRequest,
  res: Response,
) => {

  if (!req.user?.id) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const userId = req.user.id;
  const { data: walletData } = await getWalletByUserId(userId);

  console.log(walletData)

  // balance
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const ata = await getAssociatedTokenAddress(new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"), new PublicKey("DG34bJWRt5CM2dVdi6b9mXzmMZRmBPhEm3UcUNEhNnab"));
  const accountInfo = await getAccount(connection, ata);
  const balanceUSDC = Number(accountInfo.amount) / 10 ** 6;
  const solLamports = await connection.getBalance(new PublicKey(walletData.walletPublicKey));
  const balanceSOL = solLamports / LAMPORTS_PER_SOL;

  // private key silcez belki ileride
  const walletInfo = {
    address: walletData.walletPublicKey,
    privateKey:
      "0x9b5e19fc2dd8f486b213768e245c70571e9bcb5b6c1ab38ea2f439d210b7262a",
    balance: [
      {
        currency: "SOL",
        amount: balanceSOL,
      },
      {
        currency: "USDC",
        amount: balanceUSDC * 100,
      },
    ],
  };

  // transactions
  const transactions = await getAllTransactions(walletData.walletPublicKey);

  // rates
  const coins = {
    "solana": {
      "tokenName": "SOL",
      "tokenAddress": "So11111111111111111111111111111111111111112",
    },
    "usd-coin": {
      "tokenName": "USDC",
      "tokenAddress": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    },
  }
  const rates = await getRates(coins);

  // mock rules
  const mockRules = {
    "active": [
      {
        "id": 4,
        "type": "transfer",
        "fromWallet": "DG34bJWRt5CM2dVdi6b9mXzmMZRmBPhEm3UcUNEhNnab",
        "toWallet": "Faurb8VUHDX4TofttSPLKNZ7ngdsoqkvLjyxuLVvgdy4",
        "currency": "SOL",
        "amount": 0.5,
        "frequency": "weekly",
        "startDate": "2025-05-20T10:00:00.000000+00:00",
        "created_at": "2025-05-15T10:52:45.331791+00:00",
        "completed_at": "",
        "transaction": {},
      },
      {
        "id": 3,
        "type": "trade",
        "tradeType": "SELL",
        "fromCurrency": "SOL",
        "toCurrency": "USDC",
        "tresholdPrice": 160,
        "tresholdDirection": "BELOW",
        "amount": 0.5,
        "created_at": "2025-05-15T10:52:45.331791+00:00",
        "completed_at": "",
        "transaction": {},
      },
    ],
    "completed": [
      {
        "id": 2,
        "type": "trade",
        "tradeType": "SELL",
        "fromCurrency": "SOL",
        "toCurrency": "USDC",
        "tresholdPrice": 156,
        "tresholdDirection": "BELOW",
        "amount": 0.5,
        "created_at": "2025-05-12T10:52:45.331791+00:00",
        "completed_at": "2025-05-14T10:52:45.331791+00:00",
        "transaction": {
          "created_at": "2025-05-14T10:52:45.331791+00:00",
          "txHash": "2vH4cqCrsLVYuEvhxoeoxUbBZ5DzRAPbgf6rAJ3BqpiPkbkTBXtQrksURrFHEZPbDfC5nmJBDuHHQCJ1mi9NS13U",
          "txHashLink": "https://explorer.solana.com/tx/2vH4cqCrsLVYuEvhxoeoxUbBZ5DzRAPbgf6rAJ3BqpiPkbkTBXtQrksURrFHEZPbDfC5nmJBDuHHQCJ1mi9NS13U?cluster=devnet?cluster=devnet"
        },
      },
      {
        "id": 1,
        "type": "trade",
        "tradeType": "BUY",
        "fromCurrency": "SOL",
        "toCurrency": "USDC",
        "tresholdPrice": 150,
        "tresholdDirection": "BELOW",
        "amount": 0.7,
        "created_at": "2025-05-11T10:52:45.331791+00:00",
        "completed_at": "2025-05-13T10:52:45.331791+00:00",
        "transaction": {
          "created_at": "2025-05-13T10:52:45.331791+00:00",
          "txHash": "4PyTRjgJfwjJTcMU57TXTvLLTM5K9cc2JFatdybZCj8Uq2J5FHheKvK2AYAg4SChtX2ZsK5JL1ZmLGp4ZxnHmf8",
          "txHashLink": "https://explorer.solana.com/tx/2vH4cqCrsLVYuEvhxoeoxUbBZ5DzRAPbgf6rAJ3BqpiPkbkTBXtQrksURrFHEZPbDfC5nmJBDuHHQCJ1mi9NS13U?cluster=devnet?cluster=devnet"
        },
      },
    ],
  }

  return res.status(200).json({
    wallet: walletInfo,
    rules: mockRules,
    transactions: transactions,
    exchangeRates: rates,
  });
});

// PATCH /api/v1/users/profile - Update user profile
router.patch("/profile", async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { name, avatar_url } = req.body;

    // Validate input
    if (!name && !avatar_url) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const updateData: Partial<Profile> = {};
    if (name) updateData.name = name;
    if (avatar_url) updateData.avatar_url = avatar_url;

    const { data, error } = await updateUserProfile(req.user.id, updateData);

    if (error) {
      return res
        .status(400)
        .json({ message: "Error updating profile", error: error.message });
    }

    return res
      .status(200)
      .json({ message: "Profile updated successfully", profile: data });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Server error updating profile" });
  }
});

export default router;
