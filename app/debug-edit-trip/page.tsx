"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { authService } from "@/lib/auth"
import { tripsService } from "@/lib/trips"
import { isSupabaseAvailable, supabase } from "@/lib/supabase"

export default function DebugEditTripPage() {
  const [tripId, setTripId] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [allTrips, setAllTrips] = useState<any[]>([])

  useEffect(() => {
    // Load all trips on page load
    const loadTrips = async () => {
      const localTrips = JSON.parse(localStorage.getItem("trips") || "[]")
      setAllTrips(localTrips)
    }
    loadTrips()
  }, [])

  const debugSpecificTrip = async (testTripId: string) => {
    setLoading(true)
    const debugResults: any[] = []

    try {
      // 1. Get current user
      const user = await authService.getCurrentUser()
      debugResults.push({
        step: "Current User",
        data: user,
        success: !!user,
      })

      if (!user) {
        setResults(debugResults)
        setLoading(false)
        return
      }

      // 2. Check if trip exists in localStorage
      const localTrips = JSON.parse(localStorage.getItem("trips") || "[]")
      const localTrip = localTrips.find((t: any) => t.id === testTripId)
      debugResults.push({
        step: "Trip in localStorage",
        data: localTrip || "Not found",
        success: !!localTrip,
      })

      // 3. Check database if available
      if (isSupabaseAvailable() && supabase) {
        try {
          const { data: dbTrip, error } = await supabase.from("trips").select("*").eq("id", testTripId).single()

          debugResults.push({
            step: "Trip in Database",
            data: dbTrip || "Not found",
            error: error?.message,
            success: !!dbTrip && !error,
          })

          // Check collaborators
          if (dbTrip) {
            const { data: collaborators, error: collabError } = await supabase
              .from("trip_collaborators")
              .select("email")
              .eq("trip_id", testTripId)

            debugResults.push({
              step: "Trip Collaborators",
              data: collaborators || [],
              error: collabError?.message,
              success: !collabError,
            })
          }
        } catch (dbError: any) {
          debugResults.push({
            step: "Database Query Error",
            error: dbError.message,
            success: false,
          })
        }
      }

      // 4. Test the actual getTripById function with detailed logging
      console.log("=== TESTING getTripById FUNCTION ===")
      console.log("Trip ID:", testTripId)
      console.log("User Email:", user.email)

      try {
        const tripResult = await tripsService.getTripById(testTripId, user.email)
        debugResults.push({
          step: "getTripById() Result",
          data: tripResult || "Returned null",
          success: !!tripResult,
        })
      } catch (error: any) {
        debugResults.push({
          step: "getTripById() Error",
          error: error.message,
          success: false,
        })
      }

      // 5. Test with different access patterns
      try {
        // Test without email
        const tripResultNoEmail = await tripsService.getTripById(testTripId)
        debugResults.push({
          step: "getTripById() Without Email",
          data: tripResultNoEmail || "Returned null",
          success: !!tripResultNoEmail,
        })
      } catch (error: any) {
        debugResults.push({
          step: "getTripById() Without Email Error",
          error: error.message,
          success: false,
        })
      }

      // 6. Manual access check
      if (localTrip) {
        const isOwnerByEmail = localTrip.user_id === user.email
        const isOwnerById = localTrip.user_id === user.id
        const isCollaborator = localTrip.collaborators && localTrip.collaborators.includes(user.email)

        debugResults.push({
          step: "Manual Access Check",
          data: {
            tripUserId: localTrip.user_id,
            currentUserEmail: user.email,
            currentUserId: user.id,
            isOwnerByEmail,
            isOwnerById,
            isCollaborator,
            tripCollaborators: localTrip.collaborators || [],
          },
          success: isOwnerByEmail || isOwnerById || isCollaborator,
        })
      }
    } catch (error: any) {
      debugResults.push({
        step: "Debug Error",
        error: error.message,
        success: false,
      })
    }

    setResults(debugResults)
    setLoading(false)
  }

  const fixTripAccess = async (testTripId: string) => {
    const user = await authService.getCurrentUser()
    if (!user) return

    // Fix localStorage trip to use current user ID
    const localTrips = JSON.parse(localStorage.getItem("trips") || "[]")
    const tripIndex = localTrips.findIndex((t: any) => t.id === testTripId)

    if (tripIndex >= 0) {
      localTrips[tripIndex].user_id = user.id
      localStorage.setItem("trips", JSON.stringify(localTrips))
      alert(`Fixed trip ${testTripId} to use user ID: ${user.id}`)

      // Reload trips
      setAllTrips(localTrips)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🔍 Edit Trip Debug Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Enter Trip ID to debug" value={tripId} onChange={(e) => setTripId(e.target.value)} />
              <Button onClick={() => debugSpecificTrip(tripId)} disabled={loading || !tripId}>
                {loading ? "Debugging..." : "Debug Trip"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Trip Selector */}
        {allTrips.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>🎯 Your Trips (Click to Debug)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {allTrips.map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <strong>{trip.title}</strong>
                      <div className="text-sm text-gray-600">
                        ID: {trip.id} | Owner: {trip.user_id}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => debugSpecificTrip(trip.id)}>
                        Debug
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => fixTripAccess(trip.id)}>
                        Fix Access
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, index) => (
              <Card key={index} className={result.success ? "border-green-200" : "border-red-200"}>
                <CardHeader>
                  <CardTitle className={`text-sm ${result.success ? "text-green-700" : "text-red-700"}`}>
                    {result.success ? "✅" : "❌"} {result.step}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.error && (
                    <div className="bg-red-50 p-3 rounded mb-3">
                      <strong>Error:</strong> {result.error}
                    </div>
                  )}
                  {result.data && (
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
