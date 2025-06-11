import { supabase, isSupabaseAvailable } from "./supabase"
import type { Database } from "./supabase"
import { invitationsService } from "./invitations"

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
      return mockTrips.filter((trip: any) => trip.userId === userId)
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
          return mockTrips.filter((trip: any) => trip.userId === userId)
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

      return tripsWithCollaborators
    } catch (error) {
      console.error("Error fetching user trips:", error)

      // Fall back to demo mode on any error
      console.log("Falling back to localStorage due to database error")
      const mockTrips = JSON.parse(localStorage.getItem("trips") || "[]")
      return mockTrips.filter((trip: any) => trip.userId === userId)
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
    console.log("=== CREATE TRIP DEBUG ===")
    console.log("Trip data received:", trip)
    console.log("Countries:", trip.countries)
    console.log("Cities:", trip.cities)
    console.log("Collaborators:", collaborators)
    console.log("User ID:", userId)

    if (!isSupabaseAvailable() || !supabase) {
      // Mock creation for demo mode
      const newTrip = {
        id: Date.now().toString(),
        title: trip.title,
        description: trip.description,
        start_date: trip.start_date,
        end_date: trip.end_date,
        user_id: userId,
        countries: trip.countries || [],
        cities: trip.cities || [],
        status: "planning",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log("Demo trip created:", newTrip)

      const existingTrips = JSON.parse(localStorage.getItem("trips") || "[]")
      const updatedTrips = [
        ...existingTrips,
        {
          ...newTrip,
          userId,
          collaborators,
          user_name: "Demo User",
          user_email: "demo@example.com",
        },
      ]
      localStorage.setItem("trips", JSON.stringify(updatedTrips))
      console.log("Trip saved to localStorage:", newTrip)

      return newTrip
    }

    try {
      console.log("Creating trip in Supabase...")

      const tripToInsert = {
        title: trip.title,
        description: trip.description,
        start_date: trip.start_date,
        end_date: trip.end_date,
        user_id: userId,
        countries: trip.countries || [],
        cities: trip.cities || [],
        status: "planning",
      }

      console.log("Trip to insert:", tripToInsert)

      // Insert the trip
      const { data: newTrip, error } = await supabase.from("trips").insert(tripToInsert).select().single()

      if (error) {
        console.error("Supabase trip creation error:", error)
        throw error
      }

      console.log("Trip created in Supabase:", newTrip)

      // Add collaborators and send invitations if any
      if (collaborators.length > 0) {
        try {
          // Get trip details and user info for the invitation
          const { data: tripData } = await supabase.from("trips").select("title").eq("id", newTrip.id).single()
          const { data: userData } = await supabase.from("profiles").select("name, email").eq("id", userId).single()

          const tripTitle = tripData?.title || newTrip.title
          const inviterName = userData?.name || "TravelPlan User"
          const inviterEmail = userData?.email || ""

          // Send invitation emails and add collaborators
          for (const email of collaborators) {
            try {
              // Send invitation email
              const emailSent = await invitationsService.sendInvitationEmail(
                newTrip.id,
                tripTitle,
                email,
                inviterName,
                inviterEmail,
              )

              if (emailSent) {
                console.log(`Invitation sent to ${email}`)
              } else {
                console.warn(`Failed to send invitation to ${email}`)
              }

              // Add to collaborators table regardless of email status
              const { error: collabError } = await supabase.from("trip_collaborators").insert({
                trip_id: newTrip.id,
                email: email,
              })

              if (collabError) {
                console.error(`Error adding collaborator ${email}:`, collabError)
              }
            } catch (error) {
              console.error(`Error processing collaborator ${email}:`, error)
            }
          }
        } catch (collabError) {
          console.warn("Could not process collaborators:", collabError)
        }
      }

      return newTrip
    } catch (error) {
      console.error("Error in createTrip:", error)

      // Fall back to demo mode on database errors
      if (error.message?.includes("policy") || error.message?.includes("permission")) {
        console.log("Database error, falling back to localStorage")
        return this.createTrip(trip, collaborators, userId)
      }

      throw error
    }
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
    if (!isSupabaseAvailable() || !supabase) {
      // Mock deletion for demo mode
      const trips = JSON.parse(localStorage.getItem("trips") || "[]")
      const filteredTrips = trips.filter((t: any) => t.id !== tripId)
      localStorage.setItem("trips", JSON.stringify(filteredTrips))
      return
    }

    const { error } = await supabase.from("trips").delete().eq("id", tripId)
    if (error) throw error
  },

  async getTripById(tripId: string): Promise<TripWithCollaborators | null> {
    if (!isSupabaseAvailable() || !supabase) {
      // Mock data for demo mode
      const trips = JSON.parse(localStorage.getItem("trips") || "[]")
      return trips.find((t: any) => t.id === tripId) || null
    }

    try {
      const { data: trip, error } = await supabase.from("trips").select("*").eq("id", tripId).single()

      if (error) {
        if (error.code === "PGRST116") return null // Not found
        throw error
      }

      // Get collaborators and user info separately
      let collaborators: string[] = []
      let user_name = "Unknown User"
      let user_email = "No email"

      try {
        const { data: collabData } = await supabase.from("trip_collaborators").select("email").eq("trip_id", trip.id)

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
    } catch (error) {
      console.error("Error fetching trip by ID:", error)
      return null
    }
  },
}
