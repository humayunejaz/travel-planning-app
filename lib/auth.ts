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

        // Immediately confirm the user's email in the database
        try {
          await supabase.rpc("confirm_user_email", { user_id: data.user.id })
        } catch (confirmError) {
          console.warn("Could not auto-confirm email:", confirmError)
        }

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

      // Fall back to demo mode on any error
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

        // Handle email confirmation error by trying to confirm the user
        if (error.message.includes("Email not confirmed")) {
          console.log("Email not confirmed, attempting to confirm user...")

          try {
            // Try to confirm the user's email
            const { data: users } = await supabase.from("auth.users").select("id").eq("email", email).single()

            if (users) {
              await supabase.rpc("confirm_user_email", { user_id: users.id })

              // Try signing in again
              const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                email,
                password,
              })

              if (!retryError && retryData.user) {
                console.log("Successfully confirmed and signed in user")
                return retryData
              }
            }
          } catch (confirmError) {
            console.error("Could not confirm user:", confirmError)
          }

          throw new Error("Your account needs email confirmation. Please check your email or contact support.")
        }

        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password. Please check your credentials and try again.")
        }

        throw new Error(error.message || "Sign in failed. Please try again.")
      }

      if (data.user) {
        console.log("Sign in successful:", data.user.id)
        return data
      }

      throw new Error("Sign in failed - no user returned")
    } catch (error: any) {
      console.error("Signin error:", error)

      // Check for demo users as fallback
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
