import { Response, Router } from "express";
import {
  AuthenticatedRequest,
  authMiddleware,
} from "../middlewares/auth.middleware";
import {
  addRule,
  addTransaction,
  deleteRule,
  toggleRule,
} from "../services/trading.service";
import { Rule, Transaction } from "../utils/mock";

const router = Router();

// All routes are protected by authentication
router.use(authMiddleware);

// POST /api/v1/trading/transactions - Add a new transaction
router.post("/transactions", async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const transaction: Transaction = req.body;

    // Validate transaction data
    if (
      !transaction.fromCurrency || !transaction.toCurrency ||
      !transaction.fromAmount || !transaction.toAmount
    ) {
      return res.status(400).json({ message: "Invalid transaction data" });
    }

    addTransaction({
      ...transaction,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json({
      message: "Transaction added successfully",
      transaction,
    });
  } catch (error) {
    console.error("Add transaction error:", error);
    return res.status(500).json({ message: "Server error adding transaction" });
  }
});

// POST /api/v1/trading/rules - Add a new trading rule
router.post("/rules", async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const rule: Rule = req.body;

    // Validate rule data
    if (!rule.fromCurrency) {
      return res.status(400).json({ message: "Invalid rule data" });
    }

    addRule({
      ...rule,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json({
      message: "Rule added successfully",
      rule,
    });
  } catch (error) {
    console.error("Add rule error:", error);
    return res.status(500).json({ message: "Server error adding rule" });
  }
});

// PATCH /api/v1/trading/rules/:id/toggle - Toggle rule status
router.patch("/rules/:id/toggle", async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { id } = req.params;

    toggleRule(id);

    return res.status(200).json({
      message: "Rule status toggled successfully",
    });
  } catch (error) {
    console.error("Toggle rule error:", error);
    return res.status(500).json({ message: "Server error toggling rule" });
  }
});

// DELETE /api/v1/trading/rules/:id - Delete a rule
router.delete("/rules/:id", async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { id } = req.params;

    deleteRule(id);

    return res.status(200).json({
      message: "Rule deleted successfully",
    });
  } catch (error) {
    console.error("Delete rule error:", error);
    return res.status(500).json({ message: "Server error deleting rule" });
  }
});

export default router;
