import { supabase, isSupabaseAvailable, generateSimpleId } from "./supabase"
import type { SimpleDatabase } from "./supabase"

type Trip = SimpleDatabase["public"]["Tables"]["trips"]["Row"]
type TripInsert = SimpleDatabase["public"]["Tables"]["trips"]["Insert"]

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
}
