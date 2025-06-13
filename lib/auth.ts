import { supabase, isSupabaseAvailable, generateSimpleId } from "./supabase"

export interface User {
  id: string
  email: string
  name: string
  role: "traveler" | "agency"
}

export const authService = {
  async signUp(email: string, password: string, name: string, role: "traveler" | "agency" = "traveler") {
    console.log("=== SIGNUP ATTEMPT ===")
    console.log("Email:", email)
    console.log("Role:", role)

    if (!isSupabaseAvailable() || !supabase) {
      console.log("Using demo mode for signup")
      const mockUser = {
        id: generateSimpleId(),
        email,
        name,
        role,
      }
      localStorage.setItem("mockUser", JSON.stringify(mockUser))
      localStorage.setItem("isAuthenticated", "true")
      return { user: mockUser, session: null }
    }

    try {
      console.log("Attempting Supabase signup with email confirmation...")

      // Get the current URL for redirect
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/confirm`
          : `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/confirm`

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: role,
          },
          // Enable email confirmation with proper redirect
          emailRedirectTo: redirectUrl,
        },
      })

      console.log("Supabase signup response:", { data, error })

      if (error) {
        console.error("Supabase signup error:", error)
        throw new Error(error.message || "Registration failed. Please try again.")
      }

      if (data.user) {
        console.log("User created successfully:", data.user.id)
        console.log("Email confirmation required:", !data.user.email_confirmed_at)

        // Create profile immediately - don't wait for email confirmation
        // This ensures the profile exists even if email confirmation is pending
        try {
          const { error: profileError } = await supabase.from("profiles").upsert({
            id: data.user.id,
            email: email,
            name: name,
            role: role,
          })

          if (profileError) {
            console.warn("Profile creation error:", profileError)
          } else {
            console.log("Profile created successfully")
          }
        } catch (profileError) {
          console.warn("Error creating profile:", profileError)
        }

        return {
          user: data.user,
          session: data.session,
          needsEmailConfirmation: !data.user.email_confirmed_at,
        }
      } else {
        throw new Error("User creation failed - no user returned")
      }
    } catch (error: any) {
      console.error("Signup error:", error)

      // Only fall back to demo mode for configuration errors
      if (
        error.message?.includes("configuration") ||
        error.message?.includes("API key") ||
        error.message?.includes("Invalid API key")
      ) {
        console.log("Falling back to demo mode due to configuration error")
        const mockUser = {
          id: generateSimpleId(),
          email,
          name,
          role,
        }
        localStorage.setItem("mockUser", JSON.stringify(mockUser))
        localStorage.setItem("isAuthenticated", "true")
        return { user: mockUser, session: null }
      }

      throw error
    }
  },

  async signIn(email: string, password: string) {
    console.log("=== SIGNIN ATTEMPT ===")
    console.log("Email:", email)

    if (!isSupabaseAvailable() || !supabase) {
      console.log("Using demo mode for signin")
      if (
        (email === "user@example.com" && password === "password") ||
        (email === "agency@example.com" && password === "password")
      ) {
        const mockUser = {
          id: generateSimpleId(),
          email,
          name: email === "agency@example.com" ? "Agency Admin" : "Test User",
          role: email === "agency@example.com" ? "agency" : "traveler",
        }
        localStorage.setItem("mockUser", JSON.stringify(mockUser))
        localStorage.setItem("isAuthenticated", "true")
        return { user: mockUser, session: null }
      } else {
        const mockUser = localStorage.getItem("mockUser")
        if (mockUser) {
          const user = JSON.parse(mockUser)
          if (user.email === email) {
            localStorage.setItem("isAuthenticated", "true")
            return { user, session: null }
          }
        }
        throw new Error("Invalid email or password")
      }
    }

    try {
      console.log("Attempting Supabase signin...")

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("Supabase signin response:", { data, error })

      if (error) {
        console.error("Supabase signin error:", error)

        // Handle email confirmation error specifically
        if (error.message.includes("Email not confirmed")) {
          throw new Error(
            "Please check your email and click the confirmation link before signing in. If you can't find the email, check your spam folder.",
          )
        }

        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password. Please check your credentials and try again.")
        }

        throw new Error(error.message || "Sign in failed. Please try again.")
      }

      if (data.user) {
        console.log("Sign in successful:", data.user.id)

        // Check if user has confirmed email
        if (!data.user.email_confirmed_at) {
          throw new Error(
            "Please confirm your email address before signing in. Check your email for the confirmation link.",
          )
        }

        // Check if profile exists, if not create it
        try {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single()

          if (profileError || !profile) {
            console.log("Profile not found, creating one...")
            const metadata = data.user.user_metadata || {}

            const { error: insertError } = await supabase.from("profiles").upsert({
              id: data.user.id,
              email: data.user.email || "",
              name: metadata.name || data.user.email?.split("@")[0] || "User",
              role: (metadata.role as "traveler" | "agency") || "traveler",
            })

            if (insertError) {
              console.warn("Error creating profile on signin:", insertError)
            } else {
              console.log("Profile created on signin")
            }
          }
        } catch (profileError) {
          console.warn("Error checking/creating profile:", profileError)
        }

        return data
      }

      throw new Error("Sign in failed - no user returned")
    } catch (error: any) {
      console.error("Signin error:", error)

      // Check for demo users as fallback only for configuration errors
      if (error.message?.includes("configuration") || error.message?.includes("API key")) {
        if (
          (email === "user@example.com" && password === "password") ||
          (email === "agency@example.com" && password === "password")
        ) {
          const mockUser = {
            id: generateSimpleId(),
            email,
            name: email === "agency@example.com" ? "Agency Admin" : "Test User",
            role: email === "agency@example.com" ? "agency" : "traveler",
          }
          localStorage.setItem("mockUser", JSON.stringify(mockUser))
          localStorage.setItem("isAuthenticated", "true")
          return { user: mockUser, session: null }
        }
      }

      throw error
    }
  },

  async signOut() {
    try {
      if (isSupabaseAvailable() && supabase) {
        const { error } = await supabase.auth.signOut()
        if (error) console.error("Supabase signout error:", error)
      }
    } catch (error) {
      console.error("Signout error:", error)
    }

    localStorage.removeItem("mockUser")
    localStorage.removeItem("isAuthenticated")
  },

  async getCurrentUser(): Promise<User | null> {
    // Try localStorage first
    const mockUser = localStorage.getItem("mockUser")
    const isAuth = localStorage.getItem("isAuthenticated")
    if (mockUser && isAuth) {
      return JSON.parse(mockUser)
    }

    if (!isSupabaseAvailable() || !supabase) {
      return null
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return null

      // Only return user if email is confirmed
      if (!user.email_confirmed_at) {
        console.log("User email not confirmed, signing out...")
        await this.signOut()
        return null
      }

      // Try to get profile
      try {
        const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (profile && !error) {
          return {
            id: profile.id,
            email: profile.email || user.email || "",
            name: profile.name || user.email?.split("@")[0] || "User",
            role: (profile.role as "traveler" | "agency") || "traveler",
          }
        } else {
          // Profile doesn't exist, create it
          console.log("Profile not found, creating one...")
          const metadata = user.user_metadata || {}

          const { error: insertError } = await supabase.from("profiles").upsert({
            id: user.id,
            email: user.email || "",
            name: metadata.name || user.email?.split("@")[0] || "User",
            role: (metadata.role as "traveler" | "agency") || "traveler",
          })

          if (insertError) {
            console.warn("Error creating profile in getCurrentUser:", insertError)
          } else {
            console.log("Profile created in getCurrentUser")

            // Try to get the newly created profile
            const { data: newProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

            if (newProfile) {
              return {
                id: newProfile.id,
                email: newProfile.email || user.email || "",
                name: newProfile.name || user.email?.split("@")[0] || "User",
                role: (newProfile.role as "traveler" | "agency") || "traveler",
              }
            }
          }
        }
      } catch (profileError) {
        console.warn("Could not fetch profile:", profileError)
      }

      // Fallback to user metadata
      const metadata = user.user_metadata || {}
      return {
        id: user.id,
        email: user.email || "",
        name: metadata.name || user.email?.split("@")[0] || "User",
        role: (metadata.role as "traveler" | "agency") || "traveler",
      }
    } catch (error) {
      console.error("Get current user error:", error)
      return null
    }
  },

  async resendConfirmation(email: string) {
    if (!isSupabaseAvailable() || !supabase) {
      throw new Error("Email confirmation not available in demo mode")
    }

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      })

      if (error) {
        throw new Error(error.message || "Failed to resend confirmation email")
      }

      return true
    } catch (error: any) {
      console.error("Resend confirmation error:", error)
      throw error
    }
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    if (!isSupabaseAvailable() || !supabase) {
      this.getCurrentUser().then(callback)
      return { data: { subscription: null } }
    }

    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser()
        callback(user)
      } else {
        callback(null)
      }
    })
  },
}
