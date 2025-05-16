import { getSupabase } from "../config/supabase";

type StakeRow = {
  stakeAccount: string;
  id: string;
  tokenName: string;
  amount: number;
  created_at: string;
  status: string;
  txHash: string;
};

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
    .from("stakechain")
    .select("id, tokenName, stakeAccount, amount, created_at, status, txHash")
    .eq("walletAddress", publicKey)
    .order("created_at", { ascending: false })
  

  const groupedStakeData = Object.values(
    (stakeData as StakeRow[]).reduce((acc: Record<string, StakeRow>, row) => {
      if (!acc[row.stakeAccount]) {
        acc[row.stakeAccount] = row;
      }
      return acc;
    }, {})
  );

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

  const typedStakeData = (groupedStakeData ?? []).map(item => ({
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