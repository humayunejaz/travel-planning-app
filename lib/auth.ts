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
    console.log("Supabase available:", isSupabaseAvailable())

    // Check if Supabase is properly configured
    if (!isSupabaseAvailable() || !supabase) {
      console.log("Using demo mode for signup - Supabase not configured")
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
      console.log("Attempting Supabase signup...")

      // First, sign up the user with email confirmation disabled
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: role,
          },
          // Disable email confirmation for demo purposes
          emailRedirectTo: undefined,
        },
      })

      console.log("Supabase signup response:", { data, error })

      if (error) {
        console.error("Supabase signup error:", error)

        // Handle specific error cases
        if (error.message.includes("User already registered")) {
          throw new Error("An account with this email already exists. Please sign in instead.")
        }

        if (error.message.includes("Email not confirmed")) {
          throw new Error("Please check your email and click the confirmation link before signing in.")
        }

        throw new Error(error.message || "Registration failed. Please try again.")
      }

      if (data.user) {
        console.log("User created successfully:", data.user.id)

        // Create profile directly without relying on triggers
        try {
          const { error: profileError } = await supabase.from("profiles").upsert({
            id: data.user.id,
            email: email,
            name: name,
            role: role,
          })

          if (profileError) {
            console.warn("Profile creation error:", profileError)
            // Don't fail the signup if profile creation fails
          } else {
            console.log("Profile created successfully")
          }
        } catch (profileError) {
          console.warn("Error creating profile:", profileError)
          // Continue with signup even if profile creation fails
        }

        // If the user is not confirmed, provide helpful message
        if (data.user && !data.user.email_confirmed_at) {
          console.log("User created but email not confirmed")
          // For demo purposes, we'll still return success
          // In production, you might want to handle this differently
        }

        return data
      } else {
        throw new Error("User creation failed - no user returned")
      }
    } catch (error: any) {
      console.error("Signup error:", error)

      // If it's any kind of database error, fall back to demo mode
      if (
        error.message?.includes("configuration") ||
        error.message?.includes("API key") ||
        error.message?.includes("infinite recursion") ||
        error.message?.includes("policy") ||
        error.message?.includes("permission")
      ) {
        console.log("Falling back to demo mode due to database error")
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
    console.log("Supabase available:", isSupabaseAvailable())

    // Check demo mode first
    if (!isSupabaseAvailable() || !supabase) {
      console.log("Using demo mode for signin")
      if (
        (email === "user@example.com" && password === "password") ||
        (email === "agency@example.com" && password === "password")
      ) {
        const mockUser = {
          id: email === "agency@example.com" ? generateSimpleId() : generateSimpleId(),
          email,
          name: email === "agency@example.com" ? "Agency Admin" : "Test User",
          role: email === "agency@example.com" ? "agency" : "traveler",
        }
        localStorage.setItem("mockUser", JSON.stringify(mockUser))
        localStorage.setItem("isAuthenticated", "true")
        return { user: mockUser, session: null }
      } else {
        // Check if this user was created in demo mode
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

        // Handle specific error cases with user-friendly messages
        if (error.message.includes("Email not confirmed")) {
          throw new Error(
            "Please check your email and click the confirmation link before signing in. If you can't find the email, check your spam folder.",
          )
        }

        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password. Please check your credentials and try again.")
        }

        if (error.message.includes("Too many requests")) {
          throw new Error("Too many login attempts. Please wait a few minutes before trying again.")
        }

        throw new Error(error.message || "Sign in failed. Please try again.")
      }

      // Check if user needs email confirmation
      if (data.user && !data.user.email_confirmed_at) {
        throw new Error("Please check your email and click the confirmation link before signing in.")
      }

      return data
    } catch (error: any) {
      console.error("Signin error:", error)

      // If it's a database error, check for demo users
      if (
        error.message?.includes("configuration") ||
        error.message?.includes("API key") ||
        error.message?.includes("infinite recursion") ||
        error.message?.includes("policy") ||
        error.message?.includes("permission")
      ) {
        console.log("Checking for demo mode fallback...")
        const mockUser = localStorage.getItem("mockUser")
        if (mockUser) {
          const user = JSON.parse(mockUser)
          if (user.email === email) {
            localStorage.setItem("isAuthenticated", "true")
            return { user, session: null }
          }
        }
      }

      throw error
    }
  },

  async signOut() {
    if (!isSupabaseAvailable() || !supabase) {
      // Mock logout
      localStorage.removeItem("mockUser")
      localStorage.removeItem("isAuthenticated")
      return
    }

    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser(): Promise<User | null> {
    if (!isSupabaseAvailable() || !supabase) {
      // Mock user from localStorage
      const mockUser = localStorage.getItem("mockUser")
      const isAuth = localStorage.getItem("isAuthenticated")
      if (mockUser && isAuth) {
        return JSON.parse(mockUser)
      }
      return null
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return null

      // Try to get profile, but use fallback if it fails
      try {
        const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (profile && !error) {
          return {
            id: profile.id,
            email: profile.email || user.email || "",
            name: profile.name || user.email?.split("@")[0] || "User",
            role: (profile.role as "traveler" | "agency") || "traveler",
          }
        }
      } catch (profileError) {
        console.warn("Could not fetch profile, using auth metadata:", profileError)
      }

      // Fallback to user metadata if profile fetch fails
      const metadata = user.user_metadata || {}
      return {
        id: user.id,
        email: user.email || "",
        name: metadata.name || user.email?.split("@")[0] || "User",
        role: (metadata.role as "traveler" | "agency") || "traveler",
      }
    } catch (error) {
      console.error("Get current user error:", error)

      // If there's any error, fall back to demo mode if available
      const mockUser = localStorage.getItem("mockUser")
      const isAuth = localStorage.getItem("isAuthenticated")
      if (mockUser && isAuth) {
        console.log("Falling back to demo mode user")
        return JSON.parse(mockUser)
      }

      return null
    }
  },

  // New method to resend confirmation email
  async resendConfirmation(email: string) {
    if (!isSupabaseAvailable() || !supabase) {
      throw new Error("Email confirmation not available in demo mode")
    }

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
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
      // For mock mode, we'll just call the callback with current user
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
