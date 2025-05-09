import { getSupabase } from "../config/supabase";

export const createUser = async (
  email: string,
  password: string,
  full_name: string | undefined,
) =>
  await getSupabase().auth.signUp({
    email,
    password,
    options: {
      data: { full_name },
      emailRedirectTo: process.env.EMAIL_REDIRECT_URL,
    },
  });

export const login = async (email: string, password: string) =>
  await getSupabase().auth.signInWithPassword({
    email,
    password,
  });

export const resetPasswordRequest = async (email: string) =>
  await getSupabase().auth.resetPasswordForEmail(email, {
    redirectTo: process.env.PASSWORD_RESET_REDIRECT_URL,
  });

export const resetPassword = async (password: string) =>
  await getSupabase().auth.updateUser({
    password,
  });

export const getUser = async (token: string) =>
  await getSupabase().auth.getUser(token);

export const getSession = async () => await getSupabase().auth.getSession();
