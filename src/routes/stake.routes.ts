import { Response, Router } from "express";
import { decrypt } from "../utils/wallet";
import { getWalletByUserId } from "../services/wallet.service";
import { getStakeByUserAndStakeId, saveStake, getStakeList } from "../services/stake.service";

import {
  Authorized,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  Lockup,
  PublicKey,
  sendAndConfirmTransaction,
  StakeProgram,
} from "@solana/web3.js";
import bs58 from "bs58";

interface StakeRecord {
  stakeAccount: string;
  created_at: string;
  [key: string]: string | number | null | undefined;
}

const router = Router();

// POST /api/v1/stake/deposit - Stake Create and Delegate
router.post("/deposit", async (
  req,
  res: Response,
) => {
  const userId = req.body.userId;
  const amount = req.body.amount;
  const { data: walletData, error: walletError } = await getWalletByUserId(
    userId,
  );
  const wallet = walletData && walletData[0];

  if (walletError || !wallet) {
    return res.status(400).json({ message: "Wallet not found" });
  }

  const publicKey = new PublicKey(wallet.walletPublicKey);
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, "base64");
  const privateKey = decrypt(wallet.walletPrivateKeyHash, key);
  const userKeypair = Keypair.fromSecretKey(bs58.decode(privateKey));

  const amountToStake = Math.floor(amount * 1e9);

  // yeni olusturulan stake hesabi
  const stakeAccount = Keypair.generate();

  //const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const connection = new Connection(process.env.HELIUS_HTTP_KEY!, "confirmed");

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
    ],
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
  const parsedInit = await connection.getParsedAccountInfo(
    stakeAccount.publicKey,
  );
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
  const delegateTxId = await sendAndConfirmTransaction(connection, delegateTx, [
    userKeypair,
  ]);
  console.log(
    `Stake account delegated to ${validatorVotePubkey}. Tx Id: ${delegateTxId}`,
  );

  // delegated olmasi lazim
  const parsedDelegate = await connection.getParsedAccountInfo(
    stakeAccount.publicKey,
  );
  console.dir(parsedDelegate.value?.data, { depth: null });

  // rent disinda kalan gercek stake amounti
  const parsedData = parsedDelegate.value?.data;
  if (parsedData && "parsed" in parsedData) {
    const parsed = parsedData.parsed;
    const delegatedLamports = Number(
      parsed?.info?.stake?.delegation?.stake || 0,
    );
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

    const txHashLink = `https://explorer.solana.com/tx/${delegateTxId}?cluster=devnet`;

    return res.status(200).json({
      userId: userId,
      txHashLink: txHashLink,
    });

  } else {
    return res.status(400).json({ message: "Stake not delegated" });
  }
});

// POST /api/v1/stake/withdraw - Stake Deactivate and Withdraw
router.post("/withdraw", async (
  req,
  res: Response,
) => {
  const userId = req.body.userId;
  const stakeId = req.body.stakeId;

  const stakeData = await getStakeByUserAndStakeId(userId, stakeId);
  const { data: walletData, error: walletError } = await getWalletByUserId(
    userId,
  );
  const wallet = walletData && walletData[0];

  if (walletError || !wallet) {
    return res.status(400).json({ message: "Wallet not found" });
  }

  // kontrol
  if (stakeData.walletAddress === wallet.walletPublicKey) {
    const publicKey = new PublicKey(wallet.walletPublicKey);
    const key = Buffer.from(process.env.ENCRYPTION_KEY!, "base64");
    const privateKey = decrypt(wallet.walletPrivateKeyHash, key);
    const userKeypair = Keypair.fromSecretKey(bs58.decode(privateKey));

    //const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const connection = new Connection(process.env.HELIUS_HTTP_KEY!, "confirmed");
    const stakeAccount = stakeData.stakeAccount;

    // deactivate et
    const deactivateTx = StakeProgram.deactivate({
      stakePubkey: new PublicKey(stakeAccount),
      authorizedPubkey: publicKey,
    });
    const deactivateTxId = await sendAndConfirmTransaction(
      connection,
      deactivateTx,
      [userKeypair],
    );
    console.log("Stake deactivated. Tx:", deactivateTxId);

    // balance kontrol
    const balance = await connection.getBalance(new PublicKey(stakeAccount));
    console.log("Stake account balance:", balance / LAMPORTS_PER_SOL);

    // stake inactive olduktan sonra withdraw edilmemisse tekrar delegate edilebilir
    await saveStake({
      userId: userId,
      walletAddress: wallet.walletPublicKey,
      tokenName: "SOL",
      tokenAddress: "So11111111111111111111111111111111111111112",
      stakeAccount: stakeData.stakeAccount,
      validator: stakeData.validator,
      amount: stakeData.amount,
      status: "deactivated",
      txHash: deactivateTxId,
    });

    // withdraw
    const withdrawTx = StakeProgram.withdraw({
      stakePubkey: new PublicKey(stakeAccount),
      authorizedPubkey: publicKey,
      toPubkey: publicKey,
      lamports: balance,
    });

    const withdrawTxId = await sendAndConfirmTransaction(
      connection,
      withdrawTx,
      [userKeypair],
    );
    console.log("Stake withdrawn. Tx:", withdrawTxId);

    await saveStake({
      userId: userId,
      walletAddress: wallet.walletPublicKey,
      tokenName: "SOL",
      tokenAddress: "So11111111111111111111111111111111111111112",
      stakeAccount: stakeData.stakeAccount,
      validator: stakeData.validator,
      amount: balance / LAMPORTS_PER_SOL,
      status: "withdrawn",
      txHash: withdrawTxId,
    });

    return res.status(200).json({
      userId: userId,
    });
  } else {
    return res
      .status(400)
      .json({ message: "not match" });
  }
});

// POST /api/v1/stake - Stake List
router.post("/", async (
  req,
  res: Response,
) => {

  const userId = req.body.userId;
  const { data, error } = await getStakeList(userId);

  if( error ){
    return res
      .status(400)
      .json({ message: "data not found" });
  }

  const groupedMap = new Map<string, StakeRecord>();
  for (const item of data as StakeRecord[]) {
    const stakeKey = item.stakeAccount;
    const existing = groupedMap.get(stakeKey);
  
    if (!existing || new Date(item.created_at) > new Date(existing.created_at)) {
      groupedMap.set(stakeKey, item);
    }
  }

  const latest = Array.from(groupedMap.values());

  console.log(latest);

  return res.status(200).json({
    userId: userId,
    stakes: latest,
  });

});

export default router;
