import { getSupabase } from "../config/supabase";

export const saveStake = async ({
  userId,
  walletAddress,
  tokenName,
  tokenAddress,
  stakeAccount,
  validator = null,
  amount,
  status,
  txHash,
}: {
  userId: string;
  walletAddress: string;
  tokenName: string;
  tokenAddress: string;
  stakeAccount: string;
  validator?: string | null;
  amount: number;
  status: string;
  txHash: string;
}) => {
  const { data, error } = await getSupabase()
    .from("stakechain")
    .insert([
      {
        profilesId: userId,
        walletAddress: walletAddress,
        tokenName: tokenName,
        tokenAddress: tokenAddress,
        stakeAccount: stakeAccount,
        validator: validator,
        amount: amount,
        status: status,
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

export const getStakeByUserAndStakeId = async (userId: string, stakeId: string) => {
  const { data, error } = await getSupabase()
    .from("stakechain")
    .select("*")
    .eq("profilesId", userId)
    .eq("id", stakeId)
    .single();

  if (error) {
    console.error("getStakeByUserAndStakeId error:", error);
    throw error;
  }

  return data;
};