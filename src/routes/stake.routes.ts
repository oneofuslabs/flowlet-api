import { Response, Router } from "express";
import { decrypt } from "../utils/wallet";
import { getWalletByUserId } from "../services/wallet.service";
import { saveStake } from "../services/stake.service";

import {
  Connection,
  clusterApiUrl,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  StakeProgram,
  Authorized,
  Lockup,
} from "@solana/web3.js";
import bs58 from "bs58";

const router = Router();

// POST /api/v1/stake/deposit - Stake Create and Delegate
router.post("/deposit", async (
  req,
  res: Response,
) => {

  const userId = req.body.userId;
  const amount = req.body.amount;
  const wallet = await getWalletByUserId(userId);
  const publicKey = new PublicKey(wallet.walletPublicKey);
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'base64');
  const privateKey = decrypt(wallet.walletPrivateKeyHash, key);
  const userKeypair = Keypair.fromSecretKey(bs58.decode(privateKey))
  
  const amountToStake = Math.floor(amount * 1e9);

  // yeni olusturulan stake hesabi
  const stakeAccount = Keypair.generate();

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // tum validatorlari al
  //const { current, delinquent } = await connection.getVoteAccounts();
  const { current } = await connection.getVoteAccounts();
  const validatorVotePubkey = new PublicKey(current[0].votePubkey);
  //console.log("current validators: ", current);
  //console.log("all validators: ", current.concat(delinquent));

  // kullanici icin StakeAccount olustur
  const createStakeAccountTx = StakeProgram.createAccount({
    authorized: new Authorized(publicKey, publicKey), // Stake Authority and Withdrawal Authority
    fromPubkey: publicKey,
    lamports: amountToStake,
    lockup: new Lockup(0, 0, publicKey), // Optional. We'll set this to 0 for demonstration purposes.
    stakePubkey: stakeAccount.publicKey,
  });
  console.log(createStakeAccountTx);

  // gonder ve confirme et
  const createStakeAccountTxId = await sendAndConfirmTransaction(
    connection,
    createStakeAccountTx,
    [
      userKeypair,
      stakeAccount, // Since we're creating a new stake account, we have that account sign as well
    ]
  );
  console.log(`Stake account created. Tx Id: ${createStakeAccountTxId}`);

  // stake hesabindaki balance i kontrol et. gelen amount ile ayni olmali
  const stakeBalance = await connection.getBalance(stakeAccount.publicKey);
  console.log(`Stake account balance: ${stakeBalance / LAMPORTS_PER_SOL} SOL`);

  // devnette patliyor
  // Verify the status of our stake account. This will start as inactive and will take some time to activate.
  //let stakeStatus = await connection.getStakeActivation(stakeAccount.publicKey);
  //console.log(`Stake account status: ${stakeStatus.state}`);

  // bu islem de ayni datayi almamizi sagliyor
  // su anki status init
  const parsedInit = await connection.getParsedAccountInfo(stakeAccount.publicKey);
  console.dir(parsedInit.value?.data, { depth: null });

  // hersey ok ise burada initialized olarak db e kaydedelim
  await saveStake({
    userId: userId,
    walletAddress: wallet.walletPublicKey,
    tokenName: "SOL",
    tokenAddress: "So11111111111111111111111111111111111111112",
    stakeAccount: stakeAccount.publicKey.toBase58(),
    validator: null,
    amount: stakeBalance / LAMPORTS_PER_SOL,
    status: "initialized",
    txHash: createStakeAccountTxId,
  });

  // secilen validator ile stake i delegate etmesi icin transaction islemi
  const delegateTx = StakeProgram.delegate({
    stakePubkey: stakeAccount.publicKey,
    authorizedPubkey: publicKey,
    votePubkey: validatorVotePubkey,
  });
  const delegateTxId = await sendAndConfirmTransaction(connection, delegateTx, [userKeypair]);
  console.log(`Stake account delegated to ${validatorVotePubkey}. Tx Id: ${delegateTxId}`);

  // delegated olmasi lazim
  const parsedDelegate = await connection.getParsedAccountInfo(stakeAccount.publicKey);
  console.dir(parsedDelegate.value?.data, { depth: null });


  // rent disinda kalan gercek stake amounti
  const parsedData = parsedDelegate.value?.data;
  if( parsedData && "parsed" in parsedData ){
    const parsed = parsedData.parsed;
    const delegatedLamports = Number(parsed?.info?.stake?.delegation?.stake || 0);
    const delegatedSOL = delegatedLamports / LAMPORTS_PER_SOL;

    await saveStake({
      userId: userId,
      walletAddress: wallet.walletPublicKey,
      tokenName: "SOL",
      tokenAddress: "So11111111111111111111111111111111111111112",
      stakeAccount: stakeAccount.publicKey.toBase58(),
      validator: validatorVotePubkey.toBase58(),
      amount: delegatedSOL,
      status: "delegated",
      txHash: delegateTxId,
    });

  }

  return res.status(200).json({
    userId: userId,
  });


});

export default router;