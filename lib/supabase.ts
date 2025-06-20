import { createClient } from "@supabase/supabase-js"

// Database types
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
          countries: string[] | null
          cities: string[] | null
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
          countries?: string[] | null
          cities?: string[] | null
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
          countries?: string[] | null
          cities?: string[] | null
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
      trip_invitations: {
        Row: {
          id: string
          trip_id: string
          email: string
          token: string
          invited_by: string
          status: string
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          email: string
          token: string
          invited_by: string
          status?: string
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          trip_id?: string
          email?: string
          token?: string
          invited_by?: string
          status?: string
          created_at?: string
          expires_at?: string
        }
      }
      agency_notes: {
        Row: {
          id: string
          trip_id: string
          agency_user_id: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          agency_user_id: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          agency_user_id?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Check if Supabase is available - NOW ENABLED!
export const isSupabaseAvailable = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Create Supabase client
export const supabase = isSupabaseAvailable()
  ? createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  : null

// Simple ID generation for fallback
export const generateSimpleId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// Add the old function name as an alias for compatibility
export const generateUserId = generateSimpleId
