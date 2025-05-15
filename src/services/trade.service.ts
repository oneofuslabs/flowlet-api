import { getSupabase } from "../config/supabase";

export const getLastTrade = async () =>
  await getSupabase()
    .from("trade")
    .select("*")
    .order("create_at", { ascending: false })
    .limit(1)
    .single();

export const saveTrade = async ({
  fromCurrency,
  toCurrency,
  amount,
  txHash,
  walletAddress,
  profilesId,
}: {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  txHash: string;
  walletAddress: string;
  profilesId: string;
}) => {
  const { data, error } = await getSupabase()
    .from("trade")
    .insert([
      {
        fromCurrency: fromCurrency,
        toCurrency: toCurrency,
        amount,
        txHash: txHash,
        walletAddress: walletAddress,
        profilesId: profilesId,
      },
    ])
    .single();

  if (error) {
    console.error("trade insert error:", error);
    throw error;
  }

  return data;
};
    