import { supabase, isSupabaseAvailable } from "./supabase"
import type { Database } from "./supabase"
import { invitationsService } from "./invitations"
import { emailService } from "./email"

type Trip = Database["public"]["Tables"]["trips"]["Row"]
type TripInsert = Database["public"]["Tables"]["trips"]["Insert"]
type TripUpdate = Database["public"]["Tables"]["trips"]["Update"]

export interface TripWithCollaborators extends Trip {
  collaborators: string[]
  user_name?: string
  user_email?: string
  countries: string[]
  cities: string[]
  status: "planning" | "confirmed" | "completed"
}

export const tripsService = {
  async getUserTrips(userId: string): Promise<TripWithCollaborators[]> {
    if (!isSupabaseAvailable() || !supabase) {
      // Mock data for demo mode
      const mockTrips = JSON.parse(localStorage.getItem("trips") || "[]")
      return mockTrips.filter((trip: any) => trip.userId === userId || trip.user_id === userId)
    }

    try {
      console.log("Fetching trips for user:", userId)

      // Simple query without complex joins to avoid RLS issues
      const { data: trips, error } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error in getUserTrips query:", error)

        // If there's a database error, fall back to demo mode
        if (error.message?.includes("infinite recursion") || error.message?.includes("policy")) {
          console.log("Database error detected, falling back to localStorage")
          const mockTrips = JSON.parse(localStorage.getItem("trips") || "[]")
          return mockTrips.filter((trip: any) => trip.userId === userId || trip.user_id === userId)
        }

        throw error
      }

      console.log("Trips fetched:", trips)

      // Get collaborators separately to avoid join issues
      const tripsWithCollaborators = await Promise.all(
        trips.map(async (trip) => {
          let collaborators: string[] = []

          try {
            const { data: collabData } = await supabase
              .from("trip_collaborators")
              .select("email")
              .eq("trip_id", trip.id)

            collaborators = collabData?.map((c) => c.email) || []
          } catch (collabError) {
            console.warn("Could not fetch collaborators for trip:", trip.id, collabError)
          }

          return {
            ...trip,
            collaborators,
            countries: trip.countries || [],
            cities: trip.cities || [],
            status: trip.status || "planning",
            user_id: trip.user_id,
          }
        }),
      )

      // Also check localStorage for any trips that might be there but not in the database
      const localTrips = JSON.parse(localStorage.getItem("trips") || "[]")
      const localTripsFiltered = localTrips.filter(
        (localTrip: any) =>
          (localTrip.userId === userId || localTrip.user_id === userId) &&
          !tripsWithCollaborators.some((dbTrip) => dbTrip.id === localTrip.id),
      )

      // Combine database and localStorage trips
      return [...tripsWithCollaborators, ...localTripsFiltered]
    } catch (error) {
      console.error("Error fetching user trips:", error)

      // Fall back to demo mode on any error
      console.log("Falling back to localStorage due to database error")
      const mockTrips = JSON.parse(localStorage.getItem("trips") || "[]")
      return mockTrips.filter((trip: any) => trip.userId === userId || trip.user_id === userId)
    }
  },

  async getAllTrips(): Promise<TripWithCollaborators[]> {
    if (!isSupabaseAvailable() || !supabase) {
      // Mock data for demo mode
      return JSON.parse(localStorage.getItem("trips") || "[]")
    }

    try {
      const { data: trips, error } = await supabase.from("trips").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching all trips:", error)
        return JSON.parse(localStorage.getItem("trips") || "[]")
      }

      // Get collaborators and user info separately
      const tripsWithDetails = await Promise.all(
        trips.map(async (trip) => {
          let collaborators: string[] = []
          let user_name = "Unknown User"
          let user_email = "No email"

          try {
            const { data: collabData } = await supabase
              .from("trip_collaborators")
              .select("email")
              .eq("trip_id", trip.id)

            collaborators = collabData?.map((c) => c.email) || []
          } catch (error) {
            console.warn("Could not fetch collaborators:", error)
          }

          try {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("name, email")
              .eq("id", trip.user_id)
              .single()

            if (profileData) {
              user_name = profileData.name
              user_email = profileData.email
            }
          } catch (error) {
            console.warn("Could not fetch user profile:", error)
          }

          return {
            ...trip,
            collaborators,
            countries: trip.countries || [],
            cities: trip.cities || [],
            status: trip.status || "planning",
            user_id: trip.user_id,
            user_name,
            user_email,
          }
        }),
      )

      return tripsWithDetails
    } catch (error) {
      console.error("Error fetching all trips:", error)
      return JSON.parse(localStorage.getItem("trips") || "[]")
    }
  },

  async createTrip(trip: Omit<TripInsert, "user_id">, collaborators: string[], userId: string): Promise<Trip> {
    console.log("🚀 === CREATE TRIP WITH DETAILED DEBUGGING ===")
    console.log("📝 Trip data:", trip)
    console.log("👥 Collaborators:", collaborators)
    console.log("👤 User ID:", userId)

    // Create a trip object for both database and localStorage
    const tripData = {
      title: trip.title,
      description: trip.description || "",
      start_date: trip.start_date,
      end_date: trip.end_date,
      user_id: userId,
      countries: trip.countries || [],
      cities: trip.cities || [],
      status: "planning" as const,
    }

    // Always save to localStorage first for reliability
    const localTripId = Date.now().toString()
    const localTrip = {
      id: localTripId,
      ...tripData,
      userId: userId, // Add both formats for compatibility
      user_id: userId,
      collaborators,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const existingTrips = JSON.parse(localStorage.getItem("trips") || "[]")
    existingTrips.push(localTrip)
    localStorage.setItem("trips", JSON.stringify(existingTrips))
    console.log("✅ Trip saved to localStorage with ID:", localTripId)

    // Try to save to database if available
    if (isSupabaseAvailable() && supabase) {
      try {
        console.log("🔍 Checking Supabase connection...")
        const { data: connectionTest, error: connectionError } = await supabase
          .from("profiles")
          .select("count")
          .limit(1)

        if (connectionError) {
          console.error("❌ Supabase connection test failed:", connectionError)
          return localTrip
        }

        console.log("✅ Supabase connection OK")
        console.log("💾 Attempting database insertion with simplified data...")

        // Try a simplified insertion first
        const { data: newTrip, error } = await supabase
          .from("trips")
          .insert({
            title: trip.title,
            description: trip.description || "",
            start_date: trip.start_date,
            end_date: trip.end_date,
            user_id: userId,
            // Omit arrays to test if that's causing issues
          })
          .select()
          .single()

        if (error) {
          console.error("❌ Database insertion failed:", error)

          // Try an even simpler insertion without dates
          console.log("🔄 Trying even simpler insertion...")
          const { data: simpleTrip, error: simpleError } = await supabase
            .from("trips")
            .insert({
              title: trip.title,
              description: trip.description || "",
              user_id: userId,
            })
            .select()
            .single()

          if (simpleError) {
            console.error("❌ Simple insertion also failed:", simpleError)

            // Check if RLS might be the issue
            console.log("🔒 Testing if RLS is the issue...")
            const { data: authData } = await supabase.auth.getUser()
            console.log("🔑 Current auth user:", authData?.user?.id)
            console.log("👤 Trying to insert with user_id:", userId)

            return localTrip
          }

          console.log("✅ Simple insertion worked! Trip created:", simpleTrip)

          // Update the trip with remaining fields
          const { data: updatedTrip, error: updateError } = await supabase
            .from("trips")
            .update({
              start_date: trip.start_date,
              end_date: trip.end_date,
              countries: trip.countries || [],
              cities: trip.cities || [],
            })
            .eq("id", simpleTrip.id)
            .select()
            .single()

          if (updateError) {
            console.warn("⚠️ Could not update with full data:", updateError)
            return simpleTrip
          }

          console.log("✅ Trip updated with full data:", updatedTrip)

          // Process collaborators in background
          if (collaborators.length > 0) {
            setTimeout(() => {
              this.processCollaboratorsWithDatabase(updatedTrip.id, updatedTrip.title, collaborators, userId)
            }, 100)
          }

          return updatedTrip
        }

        console.log("✅ Trip created in database:", newTrip)

        // Now try to update with arrays
        if (trip.countries?.length > 0 || trip.cities?.length > 0) {
          console.log("🔄 Updating with arrays data...")
          const { data: updatedTrip, error: updateError } = await supabase
            .from("trips")
            .update({
              countries: trip.countries || [],
              cities: trip.cities || [],
            })
            .eq("id", newTrip.id)
            .select()
            .single()

          if (updateError) {
            console.warn("⚠️ Could not update arrays:", updateError)
          } else {
            console.log("✅ Arrays updated successfully")
          }
        }

        // Process collaborators in background
        if (collaborators.length > 0) {
          setTimeout(() => {
            this.processCollaboratorsWithDatabase(newTrip.id, newTrip.title, collaborators, userId)
          }, 100)
        }

        return newTrip
      } catch (error) {
        console.error("❌ Unexpected error during database creation:", error)
      }
    } else {
      console.log("⚠️ Supabase not available, using localStorage only")
    }

    // Process collaborators for localStorage trip
    if (collaborators.length > 0) {
      setTimeout(() => {
        this.processCollaboratorsSimple(localTripId, trip.title, collaborators)
      }, 100)
    }

    return localTrip
  },

  async processCollaboratorsWithDatabase(tripId: string, tripTitle: string, collaborators: string[], userId: string) {
    console.log("📧 === DATABASE COLLABORATOR PROCESSING ===")

    for (const email of collaborators) {
      try {
        console.log(`📨 Processing ${email}...`)

        // Add to database collaborators table
        if (isSupabaseAvailable() && supabase) {
          try {
            const { error: collabError } = await supabase.from("trip_collaborators").insert({
              trip_id: tripId,
              email: email,
            })

            if (collabError) {
              console.error(`❌ Error adding collaborator ${email} to database:`, collabError)
            } else {
              console.log(`✅ ${email} added to collaborators table`)
            }
          } catch (dbError) {
            console.warn(`⚠️ Database error for ${email}:`, dbError)
          }
        }

        // Create invitation
        const invitation = await invitationsService.createInvitation(tripId, email, "demo@example.com")
        console.log(`✅ Invitation created for ${email}`)

        // Try to send email (don't let it block)
        emailService
          .sendTripInvitation({
            recipientEmail: email,
            tripTitle: tripTitle,
            inviterName: "Demo User",
            inviterEmail: "demo@example.com",
            tripId: tripId,
            invitationToken: invitation.token,
          })
          .catch((error) => {
            console.warn(`⚠️ Email failed for ${email}:`, error)
          })
      } catch (error) {
        console.warn(`⚠️ Failed to process ${email}:`, error)
      }
    }

    console.log("🎉 Database collaborator processing completed")
  },

  async processCollaboratorsSimple(tripId: string, tripTitle: string, collaborators: string[]) {
    console.log("📧 === SIMPLE COLLABORATOR PROCESSING ===")

    for (const email of collaborators) {
      try {
        console.log(`📨 Processing ${email}...`)

        // Create invitation
        const invitation = await invitationsService.createInvitation(tripId, email, "demo@example.com")
        console.log(`✅ Invitation created for ${email}`)

        // Try to send email (don't let it block)
        emailService
          .sendTripInvitation({
            recipientEmail: email,
            tripTitle: tripTitle,
            inviterName: "Demo User",
            inviterEmail: "demo@example.com",
            tripId: tripId,
            invitationToken: invitation.token,
          })
          .catch((error) => {
            console.warn(`⚠️ Email failed for ${email}:`, error)
          })
      } catch (error) {
        console.warn(`⚠️ Failed to process ${email}:`, error)
      }
    }

    console.log("🎉 Collaborator processing completed")
  },

  async updateTrip(tripId: string, updates: TripUpdate, collaborators?: string[]): Promise<Trip> {
    if (!isSupabaseAvailable() || !supabase) {
      // Mock update for demo mode
      const trips = JSON.parse(localStorage.getItem("trips") || "[]")
      const tripIndex = trips.findIndex((t: any) => t.id === tripId)
      if (tripIndex >= 0) {
        trips[tripIndex] = { ...trips[tripIndex], ...updates }
        if (collaborators !== undefined) {
          trips[tripIndex].collaborators = collaborators
        }
        localStorage.setItem("trips", JSON.stringify(trips))
        return trips[tripIndex]
      }
      throw new Error("Trip not found")
    }

    try {
      const { data: updatedTrip, error } = await supabase
        .from("trips")
        .update(updates)
        .eq("id", tripId)
        .select()
        .single()

      if (error) throw error

      // Update collaborators if provided
      if (collaborators !== undefined) {
        try {
          // First delete existing collaborators
          await supabase.from("trip_collaborators").delete().eq("trip_id", tripId)

          // Then add new ones
          if (collaborators.length > 0) {
            await supabase.from("trip_collaborators").insert(
              collaborators.map((email) => ({
                trip_id: tripId,
                email: email,
              })),
            )
          }
        } catch (collabError) {
          console.warn("Could not update collaborators:", collabError)
        }
      }

      return updatedTrip
    } catch (error) {
      console.error("Error updating trip:", error)
      throw error
    }
  },

  async deleteTrip(tripId: string): Promise<void> {
    // Delete from localStorage
    const trips = JSON.parse(localStorage.getItem("trips") || "[]")
    const filteredTrips = trips.filter((t: any) => t.id !== tripId)
    localStorage.setItem("trips", JSON.stringify(filteredTrips))

    // Try to delete from database if available
    if (isSupabaseAvailable() && supabase) {
      try {
        const { error } = await supabase.from("trips").delete().eq("id", tripId)
        if (error) {
          console.warn("Could not delete trip from database:", error)
        }
      } catch (error) {
        console.warn("Error during database deletion:", error)
      }
    }
  },

  async getTripById(tripId: string): Promise<TripWithCollaborators | null> {
    console.log("🔍 Getting trip by ID:", tripId)

    // Try database first
    if (isSupabaseAvailable() && supabase) {
      try {
        console.log("📊 Checking database for trip...")
        const { data: trip, error } = await supabase.from("trips").select("*").eq("id", tripId).single()

        if (!error && trip) {
          console.log("✅ Found trip in database:", trip)

          // Get collaborators separately
          let collaborators: string[] = []
          try {
            const { data: collabData } = await supabase
              .from("trip_collaborators")
              .select("email")
              .eq("trip_id", trip.id)

            collaborators = collabData?.map((c) => c.email) || []
          } catch (error) {
            console.warn("Could not fetch collaborators:", error)
          }

          return {
            ...trip,
            collaborators,
            countries: trip.countries || [],
            cities: trip.cities || [],
            status: trip.status || "planning",
            user_id: trip.user_id,
          }
        }

        console.log("❌ Trip not found in database:", error)
      } catch (error) {
        console.error("Database error:", error)
      }
    }

    // Fallback to localStorage
    console.log("📦 Checking localStorage for trip...")
    const trips = JSON.parse(localStorage.getItem("trips") || "[]")
    const localTrip = trips.find((t: any) => t.id === tripId)

    if (localTrip) {
      console.log("✅ Found trip in localStorage:", localTrip)
      return {
        id: localTrip.id,
        title: localTrip.title,
        description: localTrip.description || "",
        start_date: localTrip.start_date,
        end_date: localTrip.end_date,
        user_id: localTrip.userId || localTrip.user_id,
        countries: localTrip.countries || [],
        cities: localTrip.cities || [],
        status: localTrip.status || "planning",
        collaborators: localTrip.collaborators || [],
        created_at: localTrip.created_at,
        updated_at: localTrip.updated_at,
      }
    }

    console.log("❌ Trip not found anywhere")
    return null
  },
}
