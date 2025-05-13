import { getSupabase } from "../config/supabase";

export const saveTransfer = async ({
  fromWallet,
  toWallet,
  tokenName,
  tokenAddress,
  amount,
  txHash,
}: {
  fromWallet: string;
  toWallet: string;
  tokenName: string;
  tokenAddress: string;
  amount: number;
  txHash: string;
}) => {
  const { data, error } = await getSupabase()
    .from("transfer")
    .insert([
      {
        fromWallet: fromWallet,
        toWallet: toWallet,
        tokenName: tokenName,
        tokenAddress: tokenAddress,
        amount: amount,
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
    