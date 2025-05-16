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
      //"tokenAddress": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
      "tokenAddress": "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr",
    },
  }
  const data = await getRates(coins);

  // BONK
  // 9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E

  // JUP
  // JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB

  // PYTH
  // FsSMi3i1i1i1i1i1i1i1i1i1i1i1i1i1i1i1i1i1i1i1

  return res.status(200).json({
    rates: data,
  });

});

export default router;