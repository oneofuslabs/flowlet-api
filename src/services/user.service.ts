import { getSupabase, supabase } from "../config/supabase";
import { Profile } from "../types/database.types";

export const getUserProfile = async (userId: string) =>
  await getSupabase()
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

export const updateUserProfile = async (
  userId: string,
  profile: Partial<Profile>,
) =>
  await supabase
    .from("profiles")
    .update(profile)
    .eq("id", userId)
    .select()
    .single();
