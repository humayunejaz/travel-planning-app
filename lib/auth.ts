"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const role = (formData.get("role") as string) || "traveler"

  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
      data: {
        name,
        role,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Create profile immediately (don't wait for email confirmation)
  try {
    const { data: userData } = await supabase.auth.getUser()
    if (userData?.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: userData.user.id,
          email,
          name,
          role,
        })
        .select()

      if (profileError && !profileError.message.includes("duplicate key")) {
        console.error("Error creating profile:", profileError)
      }
    }
  } catch (err) {
    console.error("Error creating profile:", err)
  }

  return { success: true }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Check if profile exists, create if it doesn't
  try {
    const { data: userData } = await supabase.auth.getUser()
    if (userData?.user) {
      const { data: profile } = await supabase.from("profiles").select().eq("id", userData.user.id).single()

      if (!profile) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: userData.user.id,
            email,
            name: email.split("@")[0], // Use part of email as name if not provided
            role: "traveler",
          })
          .select()

        if (profileError) {
          console.error("Error creating profile during sign in:", profileError)
        }
      }
    }
  } catch (err) {
    console.error("Error checking/creating profile:", err)
  }

  revalidatePath("/")
  redirect("/dashboard")
}

export async function signOut() {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })

  await supabase.auth.signOut()
  revalidatePath("/")
  redirect("/")
}

export async function getUser() {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Check if profile exists, create if it doesn't
    const { data: profile } = await supabase.from("profiles").select().eq("id", user.id).single()

    if (!profile) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email!,
          name: user.user_metadata.name || user.email!.split("@")[0],
          role: user.user_metadata.role || "traveler",
        })
        .select()

      if (profileError) {
        console.error("Error creating profile during getUser:", profileError)
      }
    }

    return {
      ...user,
      profile: profile || {
        id: user.id,
        email: user.email,
        name: user.user_metadata.name || user.email!.split("@")[0],
        role: user.user_metadata.role || "traveler",
      },
    }
  }

  return null
}
