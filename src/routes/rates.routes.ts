import { Response, Router } from "express";
import { getRates } from "../services/rates.service";

const router = Router();

// GET /api/v1/rates - Coin prices and rates
router.get("/", async (
  req,
  res: Response,
) => {

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
  const data = await getRates(coins);

  return res.status(200).json({
    rates: data,
  });

});

export default router;