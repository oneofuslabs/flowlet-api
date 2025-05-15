import { Response, Router } from "express";
import { saveTransfer } from "../services/transfer.service";
import { decrypt } from "../utils/wallet";
import { getPrivateKeyHash } from "../services/wallet.service";
import { 
  getMint, 
  getAssociatedTokenAddress,
  createTransferInstruction 
} from "@solana/spl-token";

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";

const router = Router();

// POST /api/v1/transfer/token - Token Transfer
router.post("/token", async (
  req,
  res: Response,
) => {

  
  const fromWallet = req.body.fromWallet;
  const toWallet = req.body.toWallet;
  const tokenName = req.body.tokenName;
  const tokenAddress = req.body.tokenAddress;
  const amount = req.body.amount;

  const { data, error} = await getPrivateKeyHash(fromWallet);
  if( error ){
    console.log(error);
    return;
  }

  // get wallet info
  const walletPrivateKeyHash = data.walletPrivateKeyHash;
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'base64');
  const privateKey = decrypt(walletPrivateKeyHash, key);

  //const RPC_URL = "https://api.devnet.solana.com";
  //const connection = new Connection(RPC_URL, "confirmed");
  const connection = new Connection(process.env.HELIUS_HTTP_KEY!, "confirmed");

  // calculate decimals for token
  const mintInfo = await getMint(connection, new PublicKey(tokenAddress));
  const decimals = mintInfo.decimals;
  const tokenAmount = amount * Math.pow(10, decimals);

  const fromKeypair = Keypair.fromSecretKey(bs58.decode(privateKey));
  const toPubkey = new PublicKey(toWallet);

  let sig = "";

  // is token solana
  if (tokenAddress === "So11111111111111111111111111111111111111112") {
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toPubkey,
        lamports: tokenAmount,
      })
    );
    sig = await sendAndConfirmTransaction(connection, tx, [fromKeypair]);

  }else{
    const mint = new PublicKey(tokenAddress);
    const fromATA = await getAssociatedTokenAddress(mint, fromKeypair.publicKey);
    const toATA = await getAssociatedTokenAddress(mint, toPubkey);
    const tx = new Transaction().add(
      createTransferInstruction(fromATA, toATA, fromKeypair.publicKey, tokenAmount)
    );
    sig = await sendAndConfirmTransaction(connection, tx, [fromKeypair]);
  }

  if( sig !== "" ){
    await saveTransfer({
      fromWallet: fromWallet,
      toWallet: toWallet,
      tokenName: tokenName,
      tokenAddress: tokenAddress,
      amount: amount,
      txHash: sig,
    })
  }

  return res.status(200).json({
    txHash: sig,
  });

});

export default router;