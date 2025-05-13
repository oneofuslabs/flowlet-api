import { getSupabase } from "../config/supabase";

export const getPrivateKeyHash = async (publicKey: string) =>
  await getSupabase()
    .from("wallet")
    .select("*")
    .eq("walletPublicKey", publicKey)
    .single();