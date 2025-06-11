import { createClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if environment variables are available
export const isSupabaseAvailable = () => {
  const hasUrl = !!(supabaseUrl && supabaseUrl !== "" && supabaseUrl !== "undefined")
  const hasKey = !!(supabaseAnonKey && supabaseAnonKey !== "" && supabaseAnonKey !== "undefined")

  console.log("Supabase environment check:", {
    url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "missing",
    key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : "missing",
    hasUrl,
    hasKey,
  })

  return hasUrl && hasKey
}

// Create Supabase client only if environment variables are available
export const supabase = (() => {
  try {
    if (isSupabaseAvailable()) {
      console.log("Creating Supabase client with URL:", supabaseUrl?.substring(0, 30) + "...")
      return createClient(supabaseUrl!, supabaseAnonKey!)
    } else {
      console.log("Supabase not available - missing environment variables")
      return null
    }
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    return null
  }
})()

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          countries: string[]
          cities: string[]
          start_date: string | null
          end_date: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          countries?: string[]
          cities?: string[]
          start_date?: string | null
          end_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          countries?: string[]
          cities?: string[]
          start_date?: string | null
          end_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      trip_collaborators: {
        Row: {
          id: string
          trip_id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          email?: string
          created_at?: string
        }
      }
    }
  }
}
