import { Response, Router } from "express";
import {
  AuthenticatedRequest,
  authMiddleware,
} from "../middlewares/auth.middleware";
import { Profile } from "../types/database.types";
import { getUserProfile, updateUserProfile } from "../services/user.service";
import {
  mockExchangeRates,
  mockRules,
  mockTransactions,
} from "../utils/mock";

import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";

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

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const ata = await getAssociatedTokenAddress(new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"), new PublicKey("DG34bJWRt5CM2dVdi6b9mXzmMZRmBPhEm3UcUNEhNnab"));
  const accountInfo = await getAccount(connection, ata);
  const balanceUSDC = Number(accountInfo.amount) / 10 ** 6;
  const solLamports = await connection.getBalance(new PublicKey("DG34bJWRt5CM2dVdi6b9mXzmMZRmBPhEm3UcUNEhNnab"));
  const balanceSOL = solLamports / LAMPORTS_PER_SOL;

  const walletInfo = {
    address: "DG34bJWRt5CM2dVdi6b9mXzmMZRmBPhEm3UcUNEhNnab",
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

  return res.status(200).json({
    wallet: walletInfo,
    rules: mockRules,
    transactions: mockTransactions,
    exchangeRates: mockExchangeRates,
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
