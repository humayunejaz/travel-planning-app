import { supabase, isSupabaseAvailable } from "./supabase"

export interface User {
  id: string
  email: string
  name: string
  role: "traveler" | "agency"
}

// Generate a proper UUID for demo mode
const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c == "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const authService = {
  async signUp(email: string, password: string, name: string, role: "traveler" | "agency" = "traveler") {
    console.log("=== SIGNUP ATTEMPT ===")
    console.log("Email:", email)
    console.log("Role:", role)

    if (!isSupabaseAvailable() || !supabase) {
      console.log("Using demo mode for signup")
      const mockUser = {
        id: generateUUID(),
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
          // Disable email confirmation for this signup
          emailRedirectTo: undefined,
        },
      })

      console.log("Supabase signup response:", { data, error })

      if (error) {
        console.error("Supabase signup error:", error)

        // Handle specific error cases
        if (error.message?.includes("User already registered")) {
          throw new Error("An account with this email already exists. Please try signing in instead.")
        } else if (error.message?.includes("Invalid email")) {
          throw new Error("Please enter a valid email address.")
        } else if (error.message?.includes("Password")) {
          throw new Error("Password must be at least 6 characters long.")
        } else {
          throw new Error("Registration failed. Please try again.")
        }
      }

      if (data.user) {
        console.log("User created successfully:", data.user.id)

        // If user needs email confirmation, try to sign them in anyway
        if (!data.session && data.user && !data.user.email_confirmed_at) {
          console.log("User created but not confirmed, attempting immediate sign in...")

          try {
            // Try to sign in immediately
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password,
            })

            if (signInData.session) {
              console.log("Successfully signed in after registration")
              data.session = signInData.session
            } else if (signInError) {
              console.log("Could not sign in immediately:", signInError.message)
              // Continue with the original flow
            }
          } catch (signInError) {
            console.log("Immediate sign in failed:", signInError)
            // Continue with the original flow
          }
        }

        // Wait a moment for the trigger to complete
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Check if profile was created by trigger
        try {
          const { data: profileCheck, error: checkError } = await supabase.rpc("check_profile_exists", {
            user_id: data.user.id,
          })

          if (checkError) {
            console.warn("Error checking profile:", checkError)
          } else if (!profileCheck) {
            console.log("Profile not created by trigger, creating manually...")
            const { error: createError } = await supabase.rpc("create_profile_safely", {
              user_id: data.user.id,
              user_email: email,
              user_name: name,
              user_role: role,
            })

            if (createError) {
              console.warn("Manual profile creation error:", createError)
            } else {
              console.log("Profile created manually")
            }
          } else {
            console.log("Profile created successfully")
          }
        } catch (profileError) {
          console.warn("Error with profile creation:", profileError)
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
          id: generateUUID(),
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

        // Handle email confirmation errors specifically
        if (error.message?.includes("Email not confirmed") || error.message?.includes("email_not_confirmed")) {
          throw new Error(
            "Please check your email and click the confirmation link, or contact support if you need help.",
          )
        } else if (error.message?.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password. Please check your credentials and try again.")
        } else {
          throw new Error(error.message || "Sign in failed. Please try again.")
        }
      }

      if (data.user) {
        console.log("Sign in successful:", data.user.id)

        // Get user metadata directly from auth.users
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError) {
          console.error("Error getting user data:", userError)
        } else {
          // Check if profile exists using RPC to avoid RLS issues
          const { data: profileExists, error: checkError } = await supabase.rpc("check_profile_exists", {
            user_id: data.user.id,
          })

          if (checkError) {
            console.error("Error checking profile:", checkError)
          } else if (!profileExists) {
            console.log("Profile not found, creating one...")
            const { error: createError } = await supabase.rpc("create_profile_safely", {
              user_id: data.user.id,
              user_email: data.user.email || "",
              user_name: userData?.user?.user_metadata?.name || data.user.email?.split("@")[0] || "User",
              user_role: (userData?.user?.user_metadata?.role as string) || "traveler",
            })

            if (createError) {
              console.error("Error creating profile:", createError)
            } else {
              console.log("Profile created successfully")
            }
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

      // After getting user data, ensure profile exists and matches
      if (data.user) {
        const userId = data.user.id
        const userEmail = data.user.email || ""

        // Get user role and name from user metadata
        const metadata = data.user.user_metadata || {}
        const userRole = metadata.role || "traveler"
        const userName = metadata.name || data.user.email?.split("@")[0] || "User"

        // Check if profile exists with correct ID
        const { data: existingProfile, error: profileError } = await supabase
          .from("profiles")
          .select("id, email, name, role")
          .eq("id", userId)
          .single()

        if (profileError || !existingProfile) {
          console.log("Profile missing or mismatched, fixing...")

          // Delete any profiles with same email but different ID
          await supabase.from("profiles").delete().eq("email", userEmail).neq("id", userId)

          // Create correct profile
          const { error: createError } = await supabase.rpc("create_profile_safely", {
            user_id: userId,
            user_email: userEmail,
            user_name: metadata.name || userEmail.split("@")[0] || "User",
            user_role: userRole,
          })

          if (createError) {
            console.warn("Could not fix profile:", createError)
          } else {
            console.log("Profile fixed successfully")
          }
        }

        // Continue with existing logic...
      }

      if (error) {
        console.error("Get user error:", error)
        return null
      }

      if (!data.user) {
        return null
      }

      // Get user role and name from user metadata
      const metadata = data.user.user_metadata || {}
      const userRole = metadata.role || "traveler"
      const userName = metadata.name || data.user.email?.split("@")[0] || "User"

      // Try to get profile using RPC to avoid RLS issues
      try {
        const { data: profileData, error: rpcError } = await supabase.rpc("get_user_profile_safely", {
          user_id: data.user.id,
        })

        if (rpcError) {
          console.warn("Error fetching profile with RPC:", rpcError)
        } else if (profileData && profileData.length > 0) {
          const profile = profileData[0]
          return {
            id: profile.id,
            email: profile.email || data.user.email || "",
            name: profile.name || userName,
            role: profile.role || userRole,
          }
        }
      } catch (rpcError) {
        console.warn("RPC error:", rpcError)
      }

      // Fallback to user metadata if profile fetch fails
      return {
        id: data.user.id,
        email: data.user.email || "",
        name: userName,
        role: userRole as "traveler" | "agency",
      }
    } catch (error) {
      console.error("Get current user error:", error)
      return null
    }
  },

  async resendConfirmation(email: string) {
    // Disable this feature entirely
    throw new Error("Email confirmation is disabled. Please try signing in directly.")
  },
}
