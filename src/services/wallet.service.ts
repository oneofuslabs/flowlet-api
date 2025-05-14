import { getSupabase } from "../config/supabase";

export const getPrivateKeyHash = async (publicKey: string) =>
  await getSupabase()
    .from("wallet")
    .select("*")
    .eq("walletPublicKey", publicKey)
    .single();

export const savePrivateKeyHash = async ({
  userId,
  publicKey,
  privateKeyHash,
}: {
  userId: string;
  publicKey: string;
  privateKeyHash: string;
}) => {
  const { data, error } = await getSupabase()
    .from("wallet")
    .insert([
      {
        profilesId: userId,
        walletPublicKey: publicKey,
        walletPrivateKeyHash: privateKeyHash,
      },
    ])
    .single();

  if (error) {
    console.error("wallet insert error:", error);
    throw error;
  }

  return data;
};

export const getWalletByUserId = async (userId: string) =>
  await getSupabase()
    .from("wallet")
    .select("*")
    .eq("profilesId", userId)
    .single();