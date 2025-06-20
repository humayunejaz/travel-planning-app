"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authService } from "@/lib/auth"
import { tripsService } from "@/lib/trips"
import { isSupabaseAvailable, supabase } from "@/lib/supabase"

export default function DebugTripAccessPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const runDebug = async () => {
    setLoading(true)
    const debugResults: any[] = []

    try {
      // 1. Check current user
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

      // 2. Check localStorage trips
      const localTrips = JSON.parse(localStorage.getItem("trips") || "[]")
      debugResults.push({
        step: "localStorage Trips",
        data: localTrips.map((t: any) => ({ id: t.id, title: t.title, user_id: t.user_id })),
        success: true,
      })

      // 3. Check database trips if available
      if (isSupabaseAvailable() && supabase) {
        try {
          const { data: dbTrips, error } = await supabase
            .from("trips")
            .select("id, title, user_id")
            .order("created_at", { ascending: false })

          debugResults.push({
            step: "Database Trips (All)",
            data: dbTrips || [],
            error: error?.message,
            success: !error,
          })

          // Check user's specific trips
          const { data: userTrips, error: userError } = await supabase
            .from("trips")
            .select("id, title, user_id")
            .eq("user_id", user.id)

          debugResults.push({
            step: "Database Trips (User Owned)",
            data: userTrips || [],
            error: userError?.message,
            success: !userError,
          })

          // Check collaborations
          const { data: collabs, error: collabError } = await supabase
            .from("trip_collaborators")
            .select("trip_id, email")
            .eq("email", user.email)

          debugResults.push({
            step: "User Collaborations",
            data: collabs || [],
            error: collabError?.message,
            success: !collabError,
          })
        } catch (dbError: any) {
          debugResults.push({
            step: "Database Access",
            error: dbError.message,
            success: false,
          })
        }
      }

      // 4. Test getUserTrips function
      try {
        const userTrips = await tripsService.getUserTrips(user.id, user.email)
        debugResults.push({
          step: "getUserTrips() Result",
          data: userTrips.map((t: any) => ({ id: t.id, title: t.title, user_id: t.user_id })),
          success: true,
        })
      } catch (error: any) {
        debugResults.push({
          step: "getUserTrips() Error",
          error: error.message,
          success: false,
        })
      }

      // 5. Test getTripById for each trip
      const allTrips = [...localTrips]
      for (const trip of allTrips) {
        try {
          const tripData = await tripsService.getTripById(trip.id, user.email)
          debugResults.push({
            step: `getTripById(${trip.id})`,
            data: tripData ? { id: tripData.id, title: tripData.title, hasAccess: true } : null,
            success: !!tripData,
          })
        } catch (error: any) {
          debugResults.push({
            step: `getTripById(${trip.id}) Error`,
            error: error.message,
            success: false,
          })
        }
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🔍 Trip Access Debug Tool</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={runDebug} disabled={loading}>
              {loading ? "Running Debug..." : "Run Debug Check"}
            </Button>
          </CardContent>
        </Card>

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
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
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
