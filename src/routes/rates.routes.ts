import { Response, Router } from "express";
import { getRates } from "../services/rates.service";

const router = Router();

// POST /api/v1/rates - Coin prices and rates
router.post("/", async (
  req,
  res: Response,
) => {

  const coinIds: string[] = req.body.coinIds;

  if (!coinIds || !Array.isArray(coinIds) || coinIds.length === 0) {
    return res.status(400).json({ error: "coinIds array is required in request body." });
  }

  const data = await getRates(coinIds);

  return res.status(200).json({
    rates: data,
  });

});

export default router;