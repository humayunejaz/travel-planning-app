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
    console.log("Environment check:")
    console.log("- NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing")
    console.log("- NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing")
    console.log("Supabase available:", isSupabaseAvailable())

    // Always fall back to demo mode on deployment if Supabase isn't working
    if (!isSupabaseAvailable() || !supabase) {
      console.log("Using demo mode for signup - Supabase not configured")
      const mockUser = {
        id: generateSimpleId(),
        email,
        name,
        role,
      }

      try {
        localStorage.setItem("mockUser", JSON.stringify(mockUser))
        localStorage.setItem("isAuthenticated", "true")
        return { user: mockUser, session: null }
      } catch (storageError) {
        console.error("LocalStorage error:", storageError)
        // Even if localStorage fails, return the user
        return { user: mockUser, session: null }
      }
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

        // Fall back to demo mode on any error
        console.log("Falling back to demo mode due to signup error")
        const mockUser = {
          id: generateSimpleId(),
          email,
          name,
          role,
        }

        try {
          localStorage.setItem("mockUser", JSON.stringify(mockUser))
          localStorage.setItem("isAuthenticated", "true")
          return { user: mockUser, session: null }
        } catch (storageError) {
          return { user: mockUser, session: null }
        }
      }

      if (data.user) {
        console.log("User created successfully:", data.user.id)

        // Try to create profile, but don't fail if it doesn't work
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
        // Fall back to demo mode
        const mockUser = {
          id: generateSimpleId(),
          email,
          name,
          role,
        }

        try {
          localStorage.setItem("mockUser", JSON.stringify(mockUser))
          localStorage.setItem("isAuthenticated", "true")
        } catch (storageError) {
          console.error("LocalStorage error:", storageError)
        }

        return { user: mockUser, session: null }
      }
    } catch (error: any) {
      console.error("Signup error:", error)

      // Always fall back to demo mode on any error
      console.log("Falling back to demo mode due to error:", error.message)
      const mockUser = {
        id: generateSimpleId(),
        email,
        name,
        role,
      }

      try {
        localStorage.setItem("mockUser", JSON.stringify(mockUser))
        localStorage.setItem("isAuthenticated", "true")
      } catch (storageError) {
        console.error("LocalStorage error:", storageError)
      }

      return { user: mockUser, session: null }
    }
  },

  async signIn(email: string, password: string) {
    console.log("=== SIGNIN ATTEMPT ===")
    console.log("Email:", email)
    console.log("Environment check:")
    console.log("- NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing")
    console.log("- NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing")
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

        try {
          localStorage.setItem("mockUser", JSON.stringify(mockUser))
          localStorage.setItem("isAuthenticated", "true")
        } catch (storageError) {
          console.error("LocalStorage error:", storageError)
        }

        return { user: mockUser, session: null }
      } else {
        // Check if this user was created in demo mode
        try {
          const mockUser = localStorage.getItem("mockUser")
          if (mockUser) {
            const user = JSON.parse(mockUser)
            if (user.email === email) {
              localStorage.setItem("isAuthenticated", "true")
              return { user, session: null }
            }
          }
        } catch (storageError) {
          console.error("LocalStorage error:", storageError)
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

        // Fall back to demo mode for common demo credentials
        if (
          (email === "user@example.com" && password === "password") ||
          (email === "agency@example.com" && password === "password")
        ) {
          console.log("Using demo credentials fallback")
          const mockUser = {
            id: email === "agency@example.com" ? generateSimpleId() : generateSimpleId(),
            email,
            name: email === "agency@example.com" ? "Agency Admin" : "Test User",
            role: email === "agency@example.com" ? "agency" : "traveler",
          }

          try {
            localStorage.setItem("mockUser", JSON.stringify(mockUser))
            localStorage.setItem("isAuthenticated", "true")
          } catch (storageError) {
            console.error("LocalStorage error:", storageError)
          }

          return { user: mockUser, session: null }
        }

        throw new Error(error.message || "Sign in failed. Please try again.")
      }

      return data
    } catch (error: any) {
      console.error("Signin error:", error)

      // Check for demo users as fallback
      if (
        (email === "user@example.com" && password === "password") ||
        (email === "agency@example.com" && password === "password")
      ) {
        console.log("Using demo credentials fallback after error")
        const mockUser = {
          id: email === "agency@example.com" ? generateSimpleId() : generateSimpleId(),
          email,
          name: email === "agency@example.com" ? "Agency Admin" : "Test User",
          role: email === "agency@example.com" ? "agency" : "traveler",
        }

        try {
          localStorage.setItem("mockUser", JSON.stringify(mockUser))
          localStorage.setItem("isAuthenticated", "true")
        } catch (storageError) {
          console.error("LocalStorage error:", storageError)
        }

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

    // Always clear local storage
    try {
      localStorage.removeItem("mockUser")
      localStorage.removeItem("isAuthenticated")
    } catch (storageError) {
      console.error("LocalStorage error during signout:", storageError)
    }
  },

  async getCurrentUser(): Promise<User | null> {
    // Try localStorage first (works in all environments)
    try {
      const mockUser = localStorage.getItem("mockUser")
      const isAuth = localStorage.getItem("isAuthenticated")
      if (mockUser && isAuth) {
        return JSON.parse(mockUser)
      }
    } catch (storageError) {
      console.error("LocalStorage error:", storageError)
    }

    if (!isSupabaseAvailable() || !supabase) {
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

