import { supabase, isSupabaseAvailable, generateSimpleId } from "./supabase"

export async function signUp(email: string) {
  if (!isSupabaseAvailable()) {
    return { error: "Supabase is not available" }
  }

  try {
    const userId = generateSimpleId()
    const { data, error } = await supabase.auth.signUp({
      email,
      password: userId,
      options: {
        data: {
          user_id: userId,
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    return { data }
  } catch (e: any) {
    return { error: e.message }
  }
}

export async function signIn(email: string) {
  if (!isSupabaseAvailable()) {
    return { error: "Supabase is not available" }
  }

  try {
    const userId = generateSimpleId()
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: {
          user_id: userId,
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    return { data }
  } catch (e: any) {
    return { error: e.message }
  }
}

