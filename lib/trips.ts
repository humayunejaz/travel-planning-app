import { supabase, isSupabaseAvailable, generateSimpleId } from "./supabase"
import type { SimpleDatabase } from "./supabase"

type Trip = SimpleDatabase["public"]["Tables"]["trips"]["Row"]
type TripInsert = SimpleDatabase["public"]["Tables"]["trips"]["Insert"]
type TripUpdate = SimpleDatabase["public"]["Tables"]["trips"]["Update"]

export interface SimpleTripWithCollaborators extends Trip {
  collaborators: string[]
}

export const tripsService = {
  async createTrip(trip: Omit<TripInsert, "user_id">, collaborators: string[], userId: string): Promise<Trip> {
    console.log("🚀 === SIMPLE TRIP CREATION ===")
    console.log("📝 Trip data:", trip)
    console.log("👤 User ID:", userId)

    // Always save to localStorage first
    const localTripId = generateSimpleId()
    const localTrip = {
      id: localTripId,
      user_id: userId,
      title: trip.title,
      description: trip.description || "",
      start_date: trip.start_date,
      end_date: trip.end_date,
      countries: trip.countries || [],
      cities: trip.cities || [],
      status: "planning",
      collaborators,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Save to localStorage
    const existingTrips = JSON.parse(localStorage.getItem("trips") || "[]")
    existingTrips.push(localTrip)
    localStorage.setItem("trips", JSON.stringify(existingTrips))
    console.log("✅ Saved to localStorage")

    // Try simple database save
    if (isSupabaseAvailable() && supabase) {
      try {
        console.log("💾 Attempting simple database save...")

        const tripData: TripInsert = {
          user_id: userId,
          title: trip.title,
          description: trip.description || "",
          start_date: trip.start_date,
          end_date: trip.end_date,
          countries: trip.countries || [],
          cities: trip.cities || [],
          status: "planning",
        }

        const { data: newTrip, error } = await supabase.from("trips").insert(tripData).select().single()

        if (error) {
          console.error("❌ Database save failed:", error)
          return localTrip as Trip
        }

        console.log("✅ Database save successful:", newTrip)
        return newTrip
      } catch (error) {
        console.error("❌ Database error:", error)
      }
    }

    return localTrip as Trip
  },

  async getUserTrips(userId: string): Promise<SimpleTripWithCollaborators[]> {
    console.log("🔍 Getting trips for user:", userId)

    let dbTrips: SimpleTripWithCollaborators[] = []

    // Try database first
    if (isSupabaseAvailable() && supabase) {
      try {
        const { data: trips, error } = await supabase
          .from("trips")
          .select("*")
          .order("created_at", { ascending: false })

        if (!error && trips) {
          dbTrips = trips.map((trip) => ({
            ...trip,
            collaborators: [],
            countries: trip.countries || [],
            cities: trip.cities || [],
          }))
          console.log(`✅ Found ${dbTrips.length} trips in database`)
        }
      } catch (error) {
        console.error("Database query failed:", error)
      }
    }

    // Get localStorage trips
    const localTrips = JSON.parse(localStorage.getItem("trips") || "[]")
    const localTripsFiltered = localTrips.filter(
      (localTrip: any) => localTrip.userId === userId || localTrip.user_id === userId,
    )

    console.log(`📦 Found ${localTripsFiltered.length} trips in localStorage`)

    // Combine results
    const allTrips = [...dbTrips, ...localTripsFiltered]
    console.log(`🎯 Returning ${allTrips.length} total trips`)

    return allTrips
  },

  async getTripById(tripId: string): Promise<SimpleTripWithCollaborators | null> {
    console.log("🔍 Getting trip by ID:", tripId)

    // Try database first
    if (isSupabaseAvailable() && supabase) {
      try {
        const { data: trip, error } = await supabase.from("trips").select("*").eq("id", tripId).single()

        if (!error && trip) {
          console.log("✅ Found trip in database:", trip)
          return {
            ...trip,
            collaborators: [],
            countries: trip.countries || [],
            cities: trip.cities || [],
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

    console.log("❌ Trip not found")
    return null
  },

  async updateTrip(tripId: string, updates: TripUpdate, collaborators?: string[]): Promise<Trip> {
    console.log("💾 Updating trip:", tripId, updates)

    // Try database first
    if (isSupabaseAvailable() && supabase) {
      try {
        const { data: updatedTrip, error } = await supabase
          .from("trips")
          .update(updates)
          .eq("id", tripId)
          .select()
          .single()

        if (!error && updatedTrip) {
          console.log("✅ Database update successful")

          // Update localStorage too
          const trips = JSON.parse(localStorage.getItem("trips") || "[]")
          const tripIndex = trips.findIndex((t: any) => t.id === tripId)
          if (tripIndex >= 0) {
            trips[tripIndex] = { ...trips[tripIndex], ...updates }
            if (collaborators !== undefined) {
              trips[tripIndex].collaborators = collaborators
            }
            localStorage.setItem("trips", JSON.stringify(trips))
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
      trips[tripIndex] = { ...trips[tripIndex], ...updates, updated_at: new Date().toISOString() }
      if (collaborators !== undefined) {
        trips[tripIndex].collaborators = collaborators
      }
      localStorage.setItem("trips", JSON.stringify(trips))
      console.log("✅ localStorage update successful")
      return trips[tripIndex]
    }

    throw new Error("Trip not found")
  },

  async deleteTrip(tripId: string): Promise<void> {
    console.log("🗑️ Deleting trip:", tripId)

    // Delete from database
    if (isSupabaseAvailable() && supabase) {
      try {
        await supabase.from("trips").delete().eq("id", tripId)
        console.log("✅ Database delete successful")
      } catch (error) {
        console.warn("Database delete failed:", error)
      }
    }

    // Delete from localStorage
    const trips = JSON.parse(localStorage.getItem("trips") || "[]")
    const filteredTrips = trips.filter((t: any) => t.id !== tripId)
    localStorage.setItem("trips", JSON.stringify(filteredTrips))
    console.log("✅ localStorage delete successful")
  },
}
