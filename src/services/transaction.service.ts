import { getSupabase } from "../config/supabase";

export const getAllTransactions = async (publicKey: string) => {
  const { data:tradeData } = await getSupabase()
    .from("trade")
    .select("*")
    .eq("walletAddress", publicKey)
    .order("created_at", { ascending: false })
  console.log({tradeData});

  const { data:transferData } = await getSupabase()
    .from("transfer")
    .select("*")
    .eq("fromWallet", publicKey)
    .order("created_at", { ascending: false })
  console.log({transferData});

  const { data:stakeData } = await getSupabase()
    .from("stake")
    .select("*")
    .eq("walletAddress", publicKey)
    .order("created_at", { ascending: false })
  console.log({stakeData});

  // type
  const typedTradeData = (tradeData ?? []).map(item => ({ ...item, type: "trade" }));
  const typedTransferData = (transferData ?? []).map(item => ({ ...item, type: "transfer" }));
  const typedStakeData = (stakeData ?? []).map(item => ({ ...item, type: "stake" }));

  const allTransactions = [...typedTradeData, ...typedTransferData, ...typedStakeData];

  // created_at desc
  allTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  console.log(allTransactions)

  return allTransactions;
}