import { Response, Router } from "express";
import { saveTrade, getLastTrade } from "../services/trade.service";

import {
  toFeeConfig,
  toApiV3Token,
  TokenAmount,
  Token,
  DEVNET_PROGRAM_ID,
  setLoggerLevel,
  LogLevel,
} from '@raydium-io/raydium-sdk-v2'
import { PublicKey, Connection } from '@solana/web3.js'
import { getAccount, getAssociatedTokenAddress, NATIVE_MINT, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { initSdk, txVersion } from "../config/raydium";
import { readCachePoolData, writeCachePoolData } from '../utils/raydiumPoolCache';

setLoggerLevel('Raydium_tradeV2', LogLevel.Debug)

const router = Router();

// POST /api/v1/trade/swap - Swap SOL for USDC
router.post("/swap", async (
  req,
  res: Response,
) => {

  const raydium = await initSdk();
  await raydium.fetchChainTime();

  const a = Number(req.body.fromAmount);
  let inputAmount = "";
  if( a === 0.1 ){
    inputAmount = "100000000"; // 0.1 SOL
  }else{
    inputAmount = "200000000"; // 0.2 SOL
  }

  //const inputAmount = '8000000';
  //const inputAmount = "100000000"; // 0.1 SOL
  const SOL = NATIVE_MINT; // or WSOLMint
  const [inputMint, outputMint] = [SOL, new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU")];
  const [inputMintStr, outputMintStr] = [inputMint.toBase58(), outputMint.toBase58()];

  // ileride cached pool data kullanilabilir
  console.log('fetching all pool basic info, this might take a while (more than 1 minutes)..');
  let poolData = readCachePoolData(1000 * 60 * 60 * 24 * 10); // example for cache 1 day
  if (poolData.ammPools.length === 0) {
    console.log(
      '**Please ensure you are using "paid" rpc node or you might encounter fetch data error due to pretty large pool data**'
    );
    console.log('fetching all pool basic info, this might take a while (more than 1 minutes)..');
    //poolData = await raydium.tradeV2.fetchRoutePoolBasicInfo()
    // devent pool info
    poolData = await raydium.tradeV2.fetchRoutePoolBasicInfo({
      amm: DEVNET_PROGRAM_ID.AmmV4,
      clmm: DEVNET_PROGRAM_ID.CLMM,
      cpmm: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM,
    });
    writeCachePoolData(poolData);
  }

  console.log('computing swap route..');
  // route here also can cache for a time period by pair to reduce time
  // e.g.{inputMint}-${outputMint}'s routes, if poolData don't change, routes should be almost same
  const raydiumRoutes = raydium.tradeV2.getAllRoute({
    inputMint,
    outputMint,
    ...poolData,
  });

  // data here also can try to cache if you wants e.g. mintInfos
  // but rpc related info doesn't suggest to cache it for a long time, because base/quote reserve and pool price change by time
  const {
    routePathDict,
    mintInfos,
    ammPoolsRpcInfo,
    ammSimulateCache,
    clmmPoolsRpcInfo,
    computeClmmPoolInfo,
    computePoolTickData,
    computeCpmmData,
  } = await raydium.tradeV2.fetchSwapRoutesData({
    routes: raydiumRoutes,
    inputMint,
    outputMint,
  });

  console.log('calculating available swap routes...');
  const swapRoutes = raydium.tradeV2.getAllRouteComputeAmountOut({
    inputTokenAmount: new TokenAmount(
      new Token({
        mint: inputMintStr,
        decimals: mintInfos[inputMintStr].decimals,
        isToken2022: mintInfos[inputMintStr].programId.equals(TOKEN_2022_PROGRAM_ID),
      }),
      inputAmount
    ),
    directPath: raydiumRoutes.directPath.map(
      (p) =>
        ammSimulateCache[p.id.toBase58()] || computeClmmPoolInfo[p.id.toBase58()] || computeCpmmData[p.id.toBase58()]
    ),
    routePathDict,
    simulateCache: ammSimulateCache,
    tickCache: computePoolTickData,
    mintInfos: mintInfos,
    outputToken: toApiV3Token({
      ...mintInfos[outputMintStr],
      programId: mintInfos[outputMintStr].programId.toBase58(),
      address: outputMintStr,
      freezeAuthority: undefined,
      mintAuthority: undefined,
      extensions: {
        feeConfig: toFeeConfig(mintInfos[outputMintStr].feeConfig),
      },
    }),
    chainTime: Math.floor(raydium.chainTimeData?.chainTime ?? Date.now() / 1000),
    slippage: 0.005, // range: 1 ~ 0.0001, means 100% ~ 0.01%
    epochInfo: await raydium.connection.getEpochInfo(),
  });

  // swapRoutes are sorted by out amount, so first one should be the best route
  const targetRoute = swapRoutes[0];
  if (!targetRoute) throw new Error('no swap routes were found');

  console.log('best swap route:', {
    input: targetRoute.amountIn.amount.toExact(),
    output: targetRoute.amountOut.amount.toExact(),
    minimumOut: targetRoute.minAmountOut.amount.toExact(),
    swapType: targetRoute.routeType,
    //routes: targetRoute.poolInfoList.map((p) => `${poolType[p.version]} ${p.id} ${(p as any).status}`).join(` -> `),
  });

  console.log('fetching swap route pool keys..');
  const poolKeys = await raydium.tradeV2.computePoolToPoolKeys({
    pools: targetRoute.poolInfoList,
    ammRpcData: ammPoolsRpcInfo,
    clmmRpcData: clmmPoolsRpcInfo,
  });

  console.log('build swap tx..');
  const { execute } = await raydium.tradeV2.swap({
    //routeProgram: Router,
    routeProgram: new PublicKey("BVChZ3XFEwTMUk1o9i3HAf91H6mFxSwa5X2wFAWhYPhU"),
    txVersion,
    swapInfo: targetRoute,
    swapPoolKeys: poolKeys,
    ownerInfo: {
      associatedOnly: true,
      checkCreateATAOwner: true,
    },
    computeBudgetConfig: {
      units: 600000,
      microLamports: 465915,
    },
  });

  console.log('execute tx..');
  // sequentially should always to be true because first tx does initialize token accounts needed for swap
  const { txIds } = await execute({ sequentially: true });
  console.log('txIds:', txIds);
  txIds.forEach((txId) => console.log(`https://explorer.solana.com/tx/${txId}?cluster=devnet`));

  const txHash = txIds[0];
  const transactionHashLink = `https://explorer.solana.com/tx/${txIds[0]}?cluster=devnet`;

  await saveTrade({
    fromCurrency: "SOL",
    toCurrency: "USDC",
    amount: 0.1,
    txHash: txHash
  });

  return res.status(200).json({
    txHashlink: transactionHashLink,
  });

});

// GET /api/v1/trade/swap - Last transaction
router.get("/swap", async (
  req,
  res: Response,
) => {

  //const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  //const ata = await getAssociatedTokenAddress(new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"), new PublicKey("DG34bJWRt5CM2dVdi6b9mXzmMZRmBPhEm3UcUNEhNnab"));
  //const accountInfo = await getAccount(connection, ata);
  //const balance = Number(accountInfo.amount) / 10 ** 6;

  let balance = 0;
  try {
    //const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const connection = new Connection(process.env.HELIUS_HTTP_KEY!, "confirmed");
    const ata = await getAssociatedTokenAddress(new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"), new PublicKey("DG34bJWRt5CM2dVdi6b9mXzmMZRmBPhEm3UcUNEhNnab"));
    const accountInfo = await getAccount(connection, ata);
    balance = Number(accountInfo.amount) / 10 ** 6;

    console.log(`💰 Wallet'taki USDC (devnet) miktarı: ${balance} USDC`);
  } catch (err) {
    if( err instanceof Error){
      if (err.message.includes("Invalid account owner") || err.message.includes("Failed to find account")) {
        console.log("📭 Bu wallet'ta devnet USDC bakiyesi yok (ATA bulunamadı).");
      } else {
        console.error("🚨 Hata:", err);
      }
    }
  }

  const data = await getLastTrade();
  return res.status(200).json({
    data: data,
    balanceUSDC: balance,
  });

});

export default router;