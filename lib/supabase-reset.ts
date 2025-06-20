import { createClient } from "@supabase/supabase-js"

// Simple database types for reset
export type SimpleDatabase = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          name: string | null
          role: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          email?: string | null
          name?: string | null
          role?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          name?: string | null
          role?: string | null
          created_at?: string | null
        }
      }
      trips: {
        Row: {
          id: string
          user_id: string | null
          title: string
          description: string | null
          start_date: string | null
          end_date: string | null
          countries: string[] | null
          cities: string[] | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          countries?: string[] | null
          cities?: string[] | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          countries?: string[] | null
          cities?: string[] | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      trip_collaborators: {
        Row: {
          id: string
          trip_id: string | null
          email: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          trip_id?: string | null
          email?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          trip_id?: string | null
          email?: string | null
          created_at?: string | null
        }
      }
    }
  }
}

// Check if Supabase is available
export const isSupabaseAvailable = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Create simple Supabase client
export const supabase = isSupabaseAvailable()
  ? createClient<SimpleDatabase>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  : null

// Simple ID generation
export const generateSimpleId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}
