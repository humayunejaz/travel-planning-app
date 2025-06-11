import { supabase, isSupabaseAvailable, generateUserId } from "./supabase"
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
    console.log("🔍 Getting trips for user:", userId)

    // Always try database first, then fallback to localStorage
    let dbTrips: TripWithCollaborators[] = []

    if (isSupabaseAvailable() && supabase) {
      try {
        console.log("📊 Querying database...")
        const { data: trips, error } = await supabase
          .from("trips")
          .select("*")
          .order("created_at", { ascending: false })

        if (!error && trips) {
          console.log(`✅ Found ${trips.length} trips in database`)

          // Get collaborators for each trip
          dbTrips = await Promise.all(
            trips.map(async (trip) => {
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
                status: (trip.status as "planning" | "confirmed" | "completed") || "planning",
                user_id: trip.user_id,
              }
            }),
          )
        } else {
          console.warn("Database query failed:", error)
        }
      } catch (error) {
        console.error("Database error:", error)
      }
    }

    // Get localStorage trips
    const localTrips = JSON.parse(localStorage.getItem("trips") || "[]")
    const localTripsFiltered = localTrips.filter(
      (localTrip: any) =>
        (localTrip.userId === userId || localTrip.user_id === userId) &&
        !dbTrips.some((dbTrip) => dbTrip.id === localTrip.id),
    )

    console.log(`📦 Found ${localTripsFiltered.length} trips in localStorage`)

    // Combine and return
    const allTrips = [...dbTrips, ...localTripsFiltered]
    console.log(`🎯 Returning ${allTrips.length} total trips`)

    return allTrips
  },

  async getAllTrips(): Promise<TripWithCollaborators[]> {
    if (!isSupabaseAvailable() || !supabase) {
      return JSON.parse(localStorage.getItem("trips") || "[]")
    }

    try {
      const { data: trips, error } = await supabase.from("trips").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching all trips:", error)
        return JSON.parse(localStorage.getItem("trips") || "[]")
      }

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
              user_name = profileData.name || "Unknown User"
              user_email = profileData.email || "No email"
            }
          } catch (error) {
            console.warn("Could not fetch user profile:", error)
          }

          return {
            ...trip,
            collaborators,
            countries: trip.countries || [],
            cities: trip.cities || [],
            status: (trip.status as "planning" | "confirmed" | "completed") || "planning",
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
    console.log("🚀 === SIMPLIFIED TRIP CREATION (LOCALSTORAGE FIRST) ===")
    console.log("📝 Trip data:", trip)
    console.log("👤 User ID:", userId)

    // Always save to localStorage first - this always works
    const localTripId = generateUserId()
    const localTrip = {
      id: localTripId,
      title: trip.title,
      description: trip.description || "",
      start_date: trip.start_date,
      end_date: trip.end_date,
      user_id: userId,
      userId: userId, // Keep both for compatibility
      countries: trip.countries || [],
      cities: trip.cities || [],
      status: "planning",
      collaborators,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const existingTrips = JSON.parse(localStorage.getItem("trips") || "[]")
    existingTrips.push(localTrip)
    localStorage.setItem("trips", JSON.stringify(existingTrips))
    console.log("✅ Saved to localStorage with ID:", localTripId)

    // Try database only if we have a real authenticated user
    if (isSupabaseAvailable() && supabase) {
      try {
        console.log("🔍 Checking if user is authenticated...")

        // Get the current authenticated user
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !authUser) {
          console.log("⚠️ No authenticated user, skipping database save")
          return localTrip as Trip
        }

        console.log("✅ Authenticated user found:", authUser.id)

        // Use the authenticated user's ID
        const tripData: TripInsert = {
          title: trip.title,
          description: trip.description || "",
          start_date: trip.start_date,
          end_date: trip.end_date,
          user_id: authUser.id, // Use the real auth user ID
          countries: trip.countries || [],
          cities: trip.cities || [],
          status: "planning",
        }

        console.log("📤 Inserting trip with auth user ID:", tripData)

        const { data: newTrip, error } = await supabase.from("trips").insert(tripData).select().single()

        if (error) {
          console.error("❌ Database insertion failed:", error)
          console.log("✅ But localStorage version is available")
          return localTrip as Trip
        }

        console.log("✅ Database insertion successful:", newTrip)

        // Add collaborators in background
        if (collaborators.length > 0) {
          setTimeout(() => {
            this.addCollaborators(newTrip.id, collaborators)
          }, 100)
        }

        return newTrip
      } catch (error) {
        console.error("❌ Database error:", error)
        console.log("✅ But localStorage version is available")
      }
    }

    // Process collaborators for localStorage trip
    if (collaborators.length > 0) {
      setTimeout(() => {
        this.addCollaborators(localTripId, collaborators)
      }, 100)
    }

    return localTrip as Trip
  },

  async addCollaborators(tripId: string, collaborators: string[]) {
    console.log("👥 Adding collaborators for trip:", tripId)

    for (const email of collaborators) {
      try {
        // Add to database if available
        if (isSupabaseAvailable() && supabase) {
          await supabase.from("trip_collaborators").insert({
            trip_id: tripId,
            email: email,
          })
        }

        // Create invitation
        await invitationsService.createInvitation(tripId, email, "demo@example.com")

        // Send email (don't wait for it)
        emailService
          .sendTripInvitation({
            recipientEmail: email,
            tripTitle: "Trip Invitation",
            inviterName: "Demo User",
            inviterEmail: "demo@example.com",
            tripId: tripId,
            invitationToken: "demo-token",
          })
          .catch(console.warn)
      } catch (error) {
        console.warn(`Failed to process collaborator ${email}:`, error)
      }
    }
  },

  async updateTrip(tripId: string, updates: TripUpdate, collaborators?: string[]): Promise<Trip> {
    // Try database first
    if (isSupabaseAvailable() && supabase) {
      try {
        const { data: updatedTrip, error } = await supabase
          .from("trips")
          .update(updates)
          .eq("id", tripId)
          .select()
          .single()

        if (!error) {
          // Update collaborators if provided
          if (collaborators !== undefined) {
            await supabase.from("trip_collaborators").delete().eq("trip_id", tripId)
            if (collaborators.length > 0) {
              await supabase
                .from("trip_collaborators")
                .insert(collaborators.map((email) => ({ trip_id: tripId, email })))
            }
          }
          return updatedTrip
        }
      } catch (error) {
        console.error("Database update failed:", error)
      }
    }

    // Fallback to localStorage
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
  },

  async deleteTrip(tripId: string): Promise<void> {
    // Delete from database
    if (isSupabaseAvailable() && supabase) {
      try {
        await supabase.from("trips").delete().eq("id", tripId)
      } catch (error) {
        console.warn("Could not delete from database:", error)
      }
    }

    // Delete from localStorage
    const trips = JSON.parse(localStorage.getItem("trips") || "[]")
    const filteredTrips = trips.filter((t: any) => t.id !== tripId)
    localStorage.setItem("trips", JSON.stringify(filteredTrips))
  },

  async getTripById(tripId: string): Promise<TripWithCollaborators | null> {
    console.log("🔍 Getting trip by ID:", tripId)

    // Try database first
    if (isSupabaseAvailable() && supabase) {
      try {
        const { data: trip, error } = await supabase.from("trips").select("*").eq("id", tripId).single()

        if (!error && trip) {
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
            status: (trip.status as "planning" | "confirmed" | "completed") || "planning",
            user_id: trip.user_id,
          }
        }
      } catch (error) {
        console.error("Database error:", error)
      }
    }

    // Fallback to localStorage
    const trips = JSON.parse(localStorage.getItem("trips") || "[]")
    const localTrip = trips.find((t: any) => t.id === tripId)

    if (localTrip) {
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

    return null
  },
}
