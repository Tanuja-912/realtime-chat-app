import { supabase } from '@/services/supabase/client'

export const signIn = async (
  email: string,
  password: string
) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export const signUp = async (
  email: string,
  password: string
) => {
  return await supabase.auth.signUp({
    email,
    password,
  })
}