import { getSupabase } from "../config/supabase";

export const saveTransfer = async ({
  fromWallet,
  toWallet,
  tokenName,
  tokenAddress,
  amount,
  txHash,
  userId,
}: {
  fromWallet: string;
  toWallet: string;
  tokenName: string;
  tokenAddress: string;
  amount: number;
  txHash: string;
  userId: string;
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
        profilesId: userId,
      },
    ])
    .single();

  if (error) {
    console.error("transfer insert error:", error);
    throw error;
  }

  return data;
};
    