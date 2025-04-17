import { supabase } from "../config/supabase";

export const createUser = async (
  email: string,
  password: string,
  full_name: string | undefined,
) =>
  await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name },
      emailRedirectTo: process.env.EMAIL_REDIRECT_URL,
    },
  });

export const login = async (email: string, password: string) =>
  await supabase.auth.signInWithPassword({
    email,
    password,
  });

export const resetPasswordRequest = async (email: string) =>
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: process.env.PASSWORD_RESET_REDIRECT_URL,
  });

export const resetPassword = async (password: string) =>
  await supabase.auth.updateUser({
    password,
  });

export const getUser = async (token: string) =>
  await supabase.auth.getUser(token);
