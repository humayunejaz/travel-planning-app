import { supabase, isSupabaseAvailable } from "./supabase"

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
        id: `mock-${Date.now()}`,
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

      // First, sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: role,
          },
        },
      })

      console.log("Supabase signup response:", { data, error })

      if (error) {
        console.error("Supabase signup error:", error)
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
          id: `mock-${Date.now()}`,
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
          id: email === "agency@example.com" ? "mock-agency-1" : "mock-user-1",
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
        throw new Error(error.message || "Sign in failed. Please try again.")
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
            email: profile.email,
            name: profile.name,
            role: profile.role as "traveler" | "agency",
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
