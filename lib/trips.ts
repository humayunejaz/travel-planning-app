import { supabase, isSupabaseAvailable } from "./supabase"

export interface Trip {
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

export interface SimpleTripWithCollaborators extends Trip {
  collaborators: string[]
}

export interface CreateTripData {
  title: string
  description?: string
  countries?: string[]
  cities?: string[]
  start_date?: string
  end_date?: string
}

// Generate a proper UUID for demo mode
const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c == "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Validate if a string is a valid UUID
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export const tripsService = {
  async createTrip(tripData: CreateTripData, collaborators: string[] = [], userId: string): Promise<Trip> {
    console.log("=== CREATING TRIP ===")
    console.log("Trip data:", tripData)
    console.log("User ID:", userId)
    console.log("User ID is valid UUID:", isValidUUID(userId))
    console.log("Supabase available:", isSupabaseAvailable())

    // Always save to localStorage first for demo mode compatibility
    const localTripId = generateUUID()
    const localTrip: Trip = {
      id: localTripId,
      user_id: userId,
      title: tripData.title,
      description: tripData.description || null,
      countries: tripData.countries || [],
      cities: tripData.cities || [],
      start_date: tripData.start_date || null,
      end_date: tripData.end_date || null,
      status: "planning",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Save to localStorage
    const existingTrips = JSON.parse(localStorage.getItem("trips") || "[]")
    existingTrips.push(localTrip)
    localStorage.setItem("trips", JSON.stringify(existingTrips))
    console.log("✅ Saved to localStorage")

    // Try database if available and user ID is valid UUID
    if (isSupabaseAvailable() && supabase && isValidUUID(userId)) {
      try {
        console.log("💾 Attempting database save...")

        // First, verify the user profile exists
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", userId)
          .single()

        if (profileError || !profile) {
          console.warn("Profile not found, trying to create it:", profileError)

          // Try to get current user info
          const { data: authUser } = await supabase.auth.getUser()
          if (authUser?.user && authUser.user.id === userId) {
            // Create the missing profile
            const { error: createProfileError } = await supabase.rpc("create_profile_safely", {
              user_id: userId,
              user_email: authUser.user.email || "",
              user_name: authUser.user.user_metadata?.name || authUser.user.email?.split("@")[0] || "User",
              user_role: "traveler",
            })

            if (createProfileError) {
              console.warn("Could not create profile:", createProfileError)
              return localTrip
            } else {
              console.log("✅ Created missing profile")
            }
          } else {
            console.warn("Cannot create profile: user mismatch")
            return localTrip
          }
        } else {
          console.log("✅ Profile exists for user")
        }

        // Now try to create the trip
        const tripToInsert = {
          user_id: userId,
          title: tripData.title,
          description: tripData.description || null,
          countries: tripData.countries || null,
          cities: tripData.cities || null,
          start_date: tripData.start_date || null,
          end_date: tripData.end_date || null,
          status: "planning",
        }

        console.log("Inserting trip:", tripToInsert)

        const { data: trip, error: tripError } = await supabase.from("trips").insert(tripToInsert).select().single()

        if (tripError) {
          console.warn("Database save failed:", tripError)
          console.warn("Error code:", tripError.code)
          console.warn("Error details:", tripError.details)
          console.warn("Error hint:", tripError.hint)
          return localTrip
        }

        console.log("✅ Database save successful:", trip)

        // Add collaborators if any
        if (collaborators.length > 0) {
          const collaboratorData = collaborators.map((email) => ({
            trip_id: trip.id,
            email: email,
          }))

          const { error: collaboratorError } = await supabase.from("trip_collaborators").insert(collaboratorData)

          if (collaboratorError) {
            console.warn("Error adding collaborators:", collaboratorError)
          } else {
            console.log("✅ Collaborators added successfully")
          }
        }

        // Update localStorage with the database trip ID
        const updatedTrips = existingTrips.map((t: any) =>
          t.id === localTripId ? { ...trip, countries: trip.countries || [], cities: trip.cities || [] } : t,
        )
        localStorage.setItem("trips", JSON.stringify(updatedTrips))

        return {
          ...trip,
          countries: trip.countries || [],
          cities: trip.cities || [],
        }
      } catch (error: any) {
        console.warn("Database error, using localStorage:", error)
        return localTrip
      }
    } else {
      console.log("Using localStorage only (demo mode or invalid UUID)")
      return localTrip
    }
  },

  async getAllTrips(): Promise<Trip[]> {
    console.log("=== GETTING ALL TRIPS (AGENCY VIEW) ===")

    let dbTrips: Trip[] = []

    // Try database first if available
    if (isSupabaseAvailable() && supabase) {
      try {
        console.log("🔍 Querying all trips from database...")

        // Get current user to check if they're an agency
        const { data: authUser } = await supabase.auth.getUser()
        console.log("Current user for agency check:", authUser?.user?.id)

        // Query all trips - RLS policies will handle access control
        const { data: trips, error } = await supabase
          .from("trips")
          .select(`
            *,
            profiles!trips_user_id_fkey (
              name,
              email,
              role
            )
          `)
          .order("created_at", { ascending: false })

        console.log("Database query result:", { trips: trips?.length, error })

        if (!error && trips) {
          dbTrips = trips.map((trip) => ({
            ...trip,
            countries: trip.countries || [],
            cities: trip.cities || [],
          }))
          console.log(`✅ Found ${dbTrips.length} trips in database`)
        } else if (error) {
          console.warn("Database query failed:", error)
          console.warn("Error code:", error.code)
          console.warn("Error details:", error.details)
        }
      } catch (error) {
        console.warn("Database query error:", error)
      }
    } else {
      console.log("Skipping database query (demo mode)")
    }

    // Get localStorage trips as fallback
    const localTrips = JSON.parse(localStorage.getItem("trips") || "[]")
    const localTripsFormatted = localTrips.map((trip: any) => ({
      ...trip,
      countries: trip.countries || [],
      cities: trip.cities || [],
    }))

    console.log(`📦 Found ${localTripsFormatted.length} trips in localStorage`)

    // If we have database trips, use those; otherwise use localStorage
    const finalTrips = dbTrips.length > 0 ? dbTrips : localTripsFormatted

    console.log(`🎯 Returning ${finalTrips.length} total trips for agency view`)
    return finalTrips
  },

  async getUserTrips(userId: string, userEmail?: string): Promise<Trip[]> {
    console.log("=== GETTING USER TRIPS ===")
    console.log("User ID:", userId)
    console.log("User Email:", userEmail)

    let dbTrips: Trip[] = []

    // Try database first if user ID is valid UUID
    if (isSupabaseAvailable() && supabase && isValidUUID(userId)) {
      try {
        console.log("🔍 Querying database for owned and collaborated trips...")

        // Get trips owned by user
        const { data: ownedTrips, error: ownedError } = await supabase
          .from("trips")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        let allDbTrips: any[] = []

        if (!ownedError && ownedTrips) {
          allDbTrips = [...ownedTrips]
          console.log(`✅ Found ${ownedTrips.length} owned trips`)
        } else if (ownedError) {
          console.warn("Error fetching owned trips:", ownedError)
        }

        // Get trips where user is a collaborator (if email is provided)
        if (userEmail) {
          console.log(`🔍 Looking for collaborations with email: ${userEmail}`)

          // Method 1: Direct join query
          const { data: collaboratorData, error: collaboratedError } = await supabase
            .from("trip_collaborators")
            .select(`
              trip_id,
              email,
              trips (*)
            `)
            .eq("email", userEmail)

          console.log("Collaborator query result:", { collaboratorData, collaboratedError })

          if (!collaboratedError && collaboratorData) {
            const collaboratorTrips = collaboratorData.filter((item) => item.trips).map((item) => item.trips)

            console.log(`✅ Found ${collaboratorTrips.length} collaborated trips via join`)
            allDbTrips = [...allDbTrips, ...collaboratorTrips]
          } else if (collaboratedError) {
            console.warn("Error fetching collaborated trips:", collaboratedError)
          }

          // Method 2: Fallback - get collaboration IDs then fetch trips
          if (collaboratorData && collaboratorData.length === 0) {
            console.log("🔄 Trying fallback method for collaborations...")

            const { data: collabIds, error: collabIdsError } = await supabase
              .from("trip_collaborators")
              .select("trip_id")
              .eq("email", userEmail)

            console.log("Collaboration IDs:", { collabIds, collabIdsError })

            if (!collabIdsError && collabIds && collabIds.length > 0) {
              const tripIds = collabIds.map((c) => c.trip_id)

              const { data: collabTrips, error: collabTripsError } = await supabase
                .from("trips")
                .select("*")
                .in("id", tripIds)

              console.log("Fallback collaborated trips:", { collabTrips, collabTripsError })

              if (!collabTripsError && collabTrips) {
                allDbTrips = [...allDbTrips, ...collabTrips]
                console.log(`✅ Found ${collabTrips.length} collaborated trips via fallback`)
              }
            }
          }
        }

        // Remove duplicates and format
        const uniqueTrips = allDbTrips.filter((trip, index, self) => index === self.findIndex((t) => t.id === trip.id))

        dbTrips = uniqueTrips.map((trip) => ({
          ...trip,
          countries: trip.countries || [],
          cities: trip.cities || [],
        }))

        console.log(`✅ Found ${dbTrips.length} total trips in database`)
      } catch (error) {
        console.warn("Database query error:", error)
      }
    } else {
      console.log("Skipping database query (demo mode or invalid UUID)")
    }

    // Get localStorage trips
    const localTrips = JSON.parse(localStorage.getItem("trips") || "[]")

    // For localStorage, we need to check both owned trips and collaborated trips
    let localTripsFiltered = localTrips.filter((localTrip: any) => localTrip.user_id === userId)

    // Also check for collaborated trips in localStorage (if email matches collaborators)
    if (userEmail) {
      const collaboratedLocalTrips = localTrips.filter(
        (localTrip: any) => localTrip.collaborators && localTrip.collaborators.includes(userEmail),
      )
      localTripsFiltered = [...localTripsFiltered, ...collaboratedLocalTrips]

      // Remove duplicates
      localTripsFiltered = localTripsFiltered.filter(
        (trip, index, self) => index === self.findIndex((t) => t.id === trip.id),
      )
    }

    const localTripsFormatted = localTripsFiltered.map((trip: any) => ({
      ...trip,
      countries: trip.countries || [],
      cities: trip.cities || [],
    }))

    console.log(`📦 Found ${localTripsFormatted.length} trips in localStorage`)

    // Combine and deduplicate results (prefer database over localStorage)
    const allTrips = [...dbTrips]

    // Add localStorage trips that aren't already in database results
    localTripsFormatted.forEach((localTrip: any) => {
      if (!allTrips.find((dbTrip) => dbTrip.id === localTrip.id)) {
        allTrips.push(localTrip)
      }
    })

    console.log(`🎯 Returning ${allTrips.length} total trips`)
    return allTrips
  },

  async getTripById(tripId: string, userEmail?: string): Promise<SimpleTripWithCollaborators | null> {
    console.log("=== GETTING TRIP BY ID ===")
    console.log("Trip ID:", tripId)
    console.log("User Email:", userEmail)

    // Try database first if available
    if (isSupabaseAvailable() && supabase && isValidUUID(tripId)) {
      try {
        // Get trip with profile information
        const { data: trip, error } = await supabase
          .from("trips")
          .select(`
            *,
            profiles!trips_user_id_fkey (
              name,
              email,
              role
            )
          `)
          .eq("id", tripId)
          .single()

        if (!error && trip) {
          console.log("✅ Trip found in database:", trip)

          // Get collaborators
          const { data: collaborators } = await supabase
            .from("trip_collaborators")
            .select("email")
            .eq("trip_id", tripId)

          const collaboratorEmails = collaborators?.map((c) => c.email) || []

          return {
            ...trip,
            collaborators: collaboratorEmails,
            countries: trip.countries || [],
            cities: trip.cities || [],
          }
        } else if (error) {
          console.warn("Database query error:", error)
        }
      } catch (error) {
        console.warn("Database query error:", error)
      }
    }

    // Fallback to localStorage
    const storedTrips = localStorage.getItem("trips")
    if (storedTrips) {
      const allTrips = JSON.parse(storedTrips)
      const trip = allTrips.find((trip: any) => trip.id === tripId)
      if (trip) {
        console.log("✅ Trip found in localStorage:", trip)
        return {
          ...trip,
          collaborators: trip.collaborators || [],
          countries: trip.countries || [],
          cities: trip.cities || [],
        }
      }
    }

    console.log("❌ Trip not found")
    return null
  },

  async updateTrip(tripId: string, updates: any, collaborators?: string[]): Promise<Trip> {
    console.log("=== UPDATING TRIP ===")
    console.log("Trip ID:", tripId)
    console.log("Updates:", updates)
    console.log("Trip ID is valid UUID:", isValidUUID(tripId))
    console.log("Supabase available:", isSupabaseAvailable())

    // Try database first if trip ID is valid UUID
    if (isSupabaseAvailable() && supabase && isValidUUID(tripId)) {
      try {
        console.log("💾 Attempting database update...")

        // Get current user info for debugging
        const { data: authUser } = await supabase.auth.getUser()
        console.log("Current auth user:", authUser?.user?.id)

        // Prepare update data
        const updateData = {
          ...updates,
          updated_at: new Date().toISOString(),
        }

        console.log("📝 Applying update with data:", updateData)

        // Try the update - RLS policies will handle access control
        const { data: updatedTrips, error: updateError } = await supabase
          .from("trips")
          .update(updateData)
          .eq("id", tripId)
          .select()

        console.log("Update result:", { updatedTrips, updateError })

        if (updateError) {
          console.error("Database update failed:", updateError)
          throw new Error(`Database update failed: ${updateError.message}`)
        }

        if (!updatedTrips || updatedTrips.length === 0) {
          throw new Error("No trips were updated - check permissions")
        }

        const updatedTrip = updatedTrips[0]
        console.log("✅ Database update successful:", updatedTrip)

        // Update collaborators if provided
        if (collaborators !== undefined) {
          console.log("Updating collaborators:", collaborators)

          // Delete existing collaborators
          const { error: deleteError } = await supabase.from("trip_collaborators").delete().eq("trip_id", tripId)

          if (deleteError) {
            console.warn("Error deleting existing collaborators:", deleteError)
          }

          // Add new collaborators
          if (collaborators.length > 0) {
            const collaboratorData = collaborators.map((email) => ({
              trip_id: tripId,
              email: email,
            }))

            const { error: insertError } = await supabase.from("trip_collaborators").insert(collaboratorData)

            if (insertError) {
              console.warn("Error adding collaborators:", insertError)
            } else {
              console.log("✅ Collaborators updated successfully")
            }
          }
        }

        // Update localStorage too (in case there's a copy there)
        try {
          const trips = JSON.parse(localStorage.getItem("trips") || "[]")
          const tripIndex = trips.findIndex((t: any) => t.id === tripId)
          if (tripIndex >= 0) {
            trips[tripIndex] = {
              ...trips[tripIndex],
              ...updatedTrip,
              countries: updatedTrip.countries || [],
              cities: updatedTrip.cities || [],
            }
            if (collaborators !== undefined) {
              trips[tripIndex].collaborators = collaborators
            }
            localStorage.setItem("trips", JSON.stringify(trips))
            console.log("✅ localStorage also updated")
          }
        } catch (localStorageError) {
          console.warn("localStorage update failed:", localStorageError)
        }

        return {
          ...updatedTrip,
          countries: updatedTrip.countries || [],
          cities: updatedTrip.cities || [],
        }
      } catch (error: any) {
        console.error("Database update error:", error)
        throw error
      }
    }

    // Fallback to localStorage only
    console.log("Falling back to localStorage update...")
    const trips = JSON.parse(localStorage.getItem("trips") || "[]")
    const tripIndex = trips.findIndex((t: any) => t.id === tripId)

    if (tripIndex >= 0) {
      trips[tripIndex] = {
        ...trips[tripIndex],
        ...updates,
        updated_at: new Date().toISOString(),
        countries: updates.countries || trips[tripIndex].countries || [],
        cities: updates.cities || trips[tripIndex].cities || [],
      }
      if (collaborators !== undefined) {
        trips[tripIndex].collaborators = collaborators
      }
      localStorage.setItem("trips", JSON.stringify(trips))
      console.log("✅ localStorage update successful")
      return trips[tripIndex]
    }

    throw new Error(`Trip not found: ${tripId}`)
  },

  async deleteTrip(tripId: string): Promise<void> {
    console.log("🗑️ Deleting trip:", tripId)

    // Delete from database if trip ID is valid UUID
    if (isSupabaseAvailable() && supabase && isValidUUID(tripId)) {
      try {
        // Delete collaborators first
        await supabase.from("trip_collaborators").delete().eq("trip_id", tripId)
        // Delete trip
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
