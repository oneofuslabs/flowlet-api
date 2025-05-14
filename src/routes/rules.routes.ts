import { Response, Router } from "express";

const router = Router();

// GET /api/v1/rules - Trade, Transfer and Stake rules
router.get("/", async (
  req,
  res: Response,
) => {

  const mockData = {
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
          "txHash": "https://explorer.solana.com/tx/2vH4cqCrsLVYuEvhxoeoxUbBZ5DzRAPbgf6rAJ3BqpiPkbkTBXtQrksURrFHEZPbDfC5nmJBDuHHQCJ1mi9NS13U?cluster=devnet",
          "txHashLink": "https://explorer.solana.com/tx/https://explorer.solana.com/tx/2vH4cqCrsLVYuEvhxoeoxUbBZ5DzRAPbgf6rAJ3BqpiPkbkTBXtQrksURrFHEZPbDfC5nmJBDuHHQCJ1mi9NS13U?cluster=devnet?cluster=devnet"
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
          "txHash": "https://explorer.solana.com/tx/2vH4cqCrsLVYuEvhxoeoxUbBZ5DzRAPbgf6rAJ3BqpiPkbkTBXtQrksURrFHEZPbDfC5nmJBDuHHQCJ1mi9NS13U?cluster=devnet",
          "txHashLink": "https://explorer.solana.com/tx/https://explorer.solana.com/tx/2vH4cqCrsLVYuEvhxoeoxUbBZ5DzRAPbgf6rAJ3BqpiPkbkTBXtQrksURrFHEZPbDfC5nmJBDuHHQCJ1mi9NS13U?cluster=devnet?cluster=devnet"
        },
      },
    ],
  }

  return res.status(200).json({
    rules: mockData,
  });

});

export default router;