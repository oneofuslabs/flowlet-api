import { Response, Router } from "express";
import { getAllTransactions } from "../services/transaction.service";

const router = Router();

// POST /api/v1/transaction/all - All Transactions
router.post("/all", async (
  req,
  res: Response,
) => {

  const walletAddress = req.body.walletAddress;
  const data = await getAllTransactions(walletAddress);

  return res.status(200).json({
    walletAddress: walletAddress,
    transactions: data,
  });

});

export default router;