import { supabase } from "../config/supabase";

export const createUser = async (
  email: string,
  password: string,
  metadata: object,
) =>
  await supabase.auth.admin.createUser({
    email,
    password,
    app_metadata: {
      ...metadata,
    },
  });

export const login = async (email: string, password: string) =>
  await supabase.auth.signInWithPassword({
    email,
    password,
  });

export const resetPassword = async (email: string) =>
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: process.env.PASSWORD_RESET_REDIRECT_URL,
  });

export const getUser = async (token: string) =>
  await supabase.auth.getUser(token);
