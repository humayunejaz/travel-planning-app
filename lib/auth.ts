import { supabase } from "./supabase"

export interface User {
  id: string
  email: string
  name: string
  role: "traveler" | "agency"
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const role = (formData.get("role") as string) || "traveler"

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/confirm`,
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
    if (data?.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          email,
          name,
          role,
        })
        .select()

      if (profileError && !profileError.message.includes("duplicate key")) {
        console.error("Error creating profile:", profileError)
      }
    }

    return { success: true }
  } catch (err: any) {
    console.error("Error during signup:", err)
    return { error: err.message || "An error occurred during signup" }
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    // Check if profile exists, create if it doesn't
    if (data?.user) {
      const { data: profile } = await supabase.from("profiles").select().eq("id", data.user.id).single()

      if (!profile) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
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

    return { success: true }
  } catch (err: any) {
    console.error("Error during signin:", err)
    return { error: err.message || "An error occurred during sign in" }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error during signout:", error)
      return { error: error.message }
    }
    return { success: true }
  } catch (err: any) {
    console.error("Error during signout:", err)
    return { error: err.message || "An error occurred during sign out" }
  }
}

export async function getUser() {
  try {
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
  } catch (err) {
    console.error("Error getting user:", err)
    return null
  }
}

