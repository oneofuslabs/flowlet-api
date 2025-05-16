import { getSupabase } from "../config/supabase";

export const getAllTransactions = async (publicKey: string) => {
  const { data:tradeData } = await getSupabase()
    .from("trade")
    .select("*")
    .eq("walletAddress", publicKey)
    .order("created_at", { ascending: false })

  const { data:transferData } = await getSupabase()
    .from("transfer")
    .select("*")
    .eq("fromWallet", publicKey)
    .order("created_at", { ascending: false })

  const { data:stakeData } = await getSupabase()
    .from("stake")
    .select("*")
    .eq("walletAddress", publicKey)
    .order("created_at", { ascending: false })

  const buildTxLink = (txHash: string) =>
    `https://explorer.solana.com/tx/${txHash}?cluster=devnet`;

  const typedTradeData = (tradeData ?? []).map(item => ({
    ...item,
    type: "trade",
    txHashLink: buildTxLink(item.txHash),
  }));

  const typedTransferData = (transferData ?? []).map(item => ({
    ...item,
    type: "transfer",
    txHashLink: buildTxLink(item.txHash),
  }));

  const typedStakeData = (stakeData ?? []).map(item => ({
    ...item,
    type: "stake",
    txHashLink: buildTxLink(item.txHash),
  }));

  const allTransactions = [
    ...typedTradeData,
    ...typedTransferData,
    ...typedStakeData,
  ];

  // created_at desc
  allTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return allTransactions;
}