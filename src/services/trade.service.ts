import { getSupabase } from "../config/supabase";

export const getLastTrade = async () =>
  await getSupabase()
    .from("trade")
    .select("*")
    .order("id", { ascending: false })
    .limit(1)
    .single();

export const saveTrade = async ({
  fromCurrency,
  toCurrency,
  amount,
  txHash,
}: {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  txHash: string;
}) => {
  const { data, error } = await getSupabase()
    .from("trade")
    .insert([
      {
        fromCurrency: fromCurrency,
        toCurrency: toCurrency,
        amount,
        txHash: txHash,
      },
    ])
    .single();

  if (error) {
    console.error("trade insert error:", error);
    throw error;
  }

  return data;
};
    