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

    if (!isSupabaseAvailable() || !supabase) {
      console.log("Using demo mode for signup")
      const mockUser = {
        id: Math.random().toString(36).substring(2, 15),
        email,
        name,
        role,
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("mockUser", JSON.stringify(mockUser))
        localStorage.setItem("isAuthenticated", "true")
      }
      return { user: mockUser, session: null }
    }

    try {
      console.log("Attempting Supabase signup...")

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

        // Create profile
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

        return data
      } else {
        throw new Error("User creation failed - no user returned")
      }
    } catch (error: any) {
      console.error("Signup error:", error)
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
          id: Math.random().toString(36).substring(2, 15),
          email,
          name: email === "agency@example.com" ? "Agency Admin" : "Test User",
          role: email === "agency@example.com" ? "agency" : "traveler",
        }
        if (typeof window !== "undefined") {
          localStorage.setItem("mockUser", JSON.stringify(mockUser))
          localStorage.setItem("isAuthenticated", "true")
        }
        return { user: mockUser, session: null }
      } else {
        if (typeof window !== "undefined") {
          const mockUser = localStorage.getItem("mockUser")
          if (mockUser) {
            const user = JSON.parse(mockUser)
            if (user.email === email) {
              localStorage.setItem("isAuthenticated", "true")
              return { user, session: null }
            }
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

      if (data.user) {
        console.log("Sign in successful:", data.user.id)

        // Check if profile exists, create if it doesn't
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (profileError && !profileError.message.includes("No rows found")) {
          console.error("Error fetching profile:", profileError)
        }

        if (!profile) {
          console.log("Profile not found, creating one...")
          const { error: insertError } = await supabase.from("profiles").insert({
            id: data.user.id,
            email: data.user.email || "",
            name: data.user.user_metadata?.name || data.user.email?.split("@")[0] || "User",
            role: (data.user.user_metadata?.role as "traveler" | "agency") || "traveler",
          })

          if (insertError) {
            console.error("Error creating profile:", insertError)
          } else {
            console.log("Profile created successfully")
          }
        }

        return data
      }

      throw new Error("Sign in failed - no user returned")
    } catch (error: any) {
      console.error("Signin error:", error)
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

    if (typeof window !== "undefined") {
      localStorage.removeItem("mockUser")
      localStorage.removeItem("isAuthenticated")
    }
  },

  async getCurrentUser(): Promise<User | null> {
    // Try localStorage first for demo mode
    if (typeof window !== "undefined") {
      const mockUser = localStorage.getItem("mockUser")
      const isAuth = localStorage.getItem("isAuthenticated")
      if (mockUser && isAuth) {
        return JSON.parse(mockUser)
      }
    }

    if (!isSupabaseAvailable() || !supabase) {
      return null
    }

    try {
      // Use getSession first to check if there's an active session
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session) {
        console.log("No active session found")
        return null
      }

      // If we have a session, get the user
      const { data, error } = await supabase.auth.getUser()

      if (error) {
        console.error("Get user error:", error)
        return null
      }

      if (!data.user) {
        return null
      }

      // Try to get profile
      try {
        const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

        if (profile && !error) {
          return {
            id: profile.id,
            email: profile.email || data.user.email || "",
            name: profile.name || data.user.user_metadata?.name || data.user.email?.split("@")[0] || "User",
            role: (profile.role as "traveler" | "agency") || "traveler",
          }
        }
      } catch (profileError) {
        console.warn("Could not fetch profile:", profileError)
      }

      // Fallback to user metadata
      const metadata = data.user.user_metadata || {}
      return {
        id: data.user.id,
        email: data.user.email || "",
        name: metadata.name || data.user.email?.split("@")[0] || "User",
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
          emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/confirm`,
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
}
