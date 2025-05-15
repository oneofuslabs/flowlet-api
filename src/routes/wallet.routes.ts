import { Response, Router } from "express";
import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction, 
  sendAndConfirmTransaction, 
} from '@solana/web3.js';
import { 
  getAssociatedTokenAddress,
  createTransferInstruction,
} from "@solana/spl-token";
import * as bs58 from 'bs58';
import { ensureTokenAccount } from "../utils/ensureTokenAddress";
import { encrypt } from "../utils/wallet";
import { savePrivateKeyHash } from "../services/wallet.service";

const router = Router();

// POST /api/v1/wallet/ - Create Wallet
router.post("/", async (
  req,
  res: Response,
) => {

  const userId = req.body.userId;
  //const RPC_URL = "https://api.devnet.solana.com";
  //const connection = new Connection(RPC_URL, "confirmed");
  const connection = new Connection(process.env.HELIUS_HTTP_KEY!, "confirmed");
  //const PROGRAM_ID = new PublicKey(process.env.PROGRAM_ID || 'MkzXKbBcCv6GtuJ3KLHRqWKQQyPn2xBYF81FcXUShg9');

  // wallet generate et
  const walletKeypair = Keypair.generate();
  const walletPublicKey = walletKeypair.publicKey.toString();
  const walletPrivateKey = bs58.encode(walletKeypair.secretKey);
  //const privateKeyArray = Array.from(walletKeypair.secretKey);

  // payer icin kendi walletimiz
  const serviceProviderKeypair = Keypair.fromSecretKey(
    bs58.decode("uqFpjudJe1QPPsqcciHWFsj6v3hmX2485XXupuwRdVx556LYvpZHWtKZCaXfMk6yo97D41zoGzuBP3wrVvcp8Zu")
  );

  // SOL icin ATA olustur
  await ensureTokenAccount({
    connection,
    mint: new PublicKey("So11111111111111111111111111111111111111112"),
    owner: walletKeypair.publicKey,
    payer: serviceProviderKeypair.publicKey,
    signer: serviceProviderKeypair,
  });

  // USDC icin ATA olustur
  const usdcATA = await ensureTokenAccount({
    connection,
    mint: new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"),
    owner: walletKeypair.publicKey,
    payer: serviceProviderKeypair.publicKey,
    signer: serviceProviderKeypair,
  });


  //0.02USDC airdrop
  const tokenAmount = 0.02 * Math.pow(10, 6); // 0.1 usdc
  const mint = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
  const fromATA = await getAssociatedTokenAddress(mint, serviceProviderKeypair.publicKey);
  const tx = new Transaction().add(
    createTransferInstruction(fromATA, usdcATA, serviceProviderKeypair.publicKey, tokenAmount)
  );
  const sig = await sendAndConfirmTransaction(connection, tx, [serviceProviderKeypair]);
  console.log(sig);

  // simdilik wallet private key encrypt edip db e yaz
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'base64');
  const privateKeyHash = encrypt(walletPrivateKey, key);
  await savePrivateKeyHash({
    userId: userId,
    publicKey: walletPublicKey,
    privateKeyHash: privateKeyHash
  })

  return res.status(200).json({
    userId: userId,
    walletAddress: walletPublicKey,
  });

});

export default router;