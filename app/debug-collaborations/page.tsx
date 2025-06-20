"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authService } from "@/lib/auth"
import { supabase, isSupabaseAvailable } from "@/lib/supabase"
import { tripsService } from "@/lib/trips"

export default function DebugCollaborationsPage() {
  const [user, setUser] = useState<any>(null)
  const [collaborations, setCollaborations] = useState<any[]>([])
  const [trips, setTrips] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [localStorageData, setLocalStorageData] = useState<any>({})
  const [testEmail, setTestEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [queryResults, setQueryResults] = useState<any>(null)

  useEffect(() => {
    loadDebugData()
  }, [])

  const loadDebugData = async () => {
    try {
      // Get current user
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      setTestEmail(currentUser?.email || "")
      console.log("Current user:", currentUser)

      // Get localStorage data
      const localTrips = JSON.parse(localStorage.getItem("trips") || "[]")
      const localInvitations = JSON.parse(localStorage.getItem("invitations") || "[]")
      const localAuth = localStorage.getItem("isAuthenticated")
      const localUser = JSON.parse(localStorage.getItem("currentUser") || "null")

      setLocalStorageData({
        trips: localTrips,
        invitations: localInvitations,
        isAuthenticated: localAuth,
        currentUser: localUser,
      })

      if (!isSupabaseAvailable() || !supabase) {
        console.log("Supabase not available")
        setLoading(false)
        return
      }

      // Get all collaborations
      const { data: allCollaborations, error: collabError } = await supabase.from("trip_collaborators").select("*")

      if (!collabError) {
        setCollaborations(allCollaborations || [])
        console.log("All collaborations:", allCollaborations)
      } else {
        console.error("Collaboration query error:", collabError)
      }

      // Get all trips
      const { data: allTrips, error: tripsError } = await supabase.from("trips").select("*")

      if (!tripsError) {
        setTrips(allTrips || [])
        console.log("All trips:", allTrips)
      } else {
        console.error("Trips query error:", tripsError)
      }

      // Get all profiles
      const { data: allProfiles, error: profilesError } = await supabase.from("profiles").select("*")

      if (!profilesError) {
        setProfiles(allProfiles || [])
        console.log("All profiles:", allProfiles)
      } else {
        console.error("Profiles query error:", profilesError)
      }

      // Test specific queries for current user
      if (currentUser?.email) {
        await testCollaborationQueries(currentUser.email)
      }
    } catch (error) {
      console.error("Debug error:", error)
    } finally {
      setLoading(false)
    }
  }

  const testCollaborationQueries = async (email: string) => {
    if (!supabase) return

    const results: any = {}

    try {
      // Test 1: Direct email match
      const { data: directMatch, error: directError } = await supabase
        .from("trip_collaborators")
        .select("*")
        .eq("email", email)

      results.directMatch = { data: directMatch, error: directError }

      // Test 2: Case insensitive match
      const { data: iLikeMatch, error: iLikeError } = await supabase
        .from("trip_collaborators")
        .select("*")
        .ilike("email", email)

      results.iLikeMatch = { data: iLikeMatch, error: iLikeError }

      // Test 3: Join with trips
      const { data: joinMatch, error: joinError } = await supabase
        .from("trip_collaborators")
        .select(`
          *,
          trips (*)
        `)
        .eq("email", email)

      results.joinMatch = { data: joinMatch, error: joinError }

      // Test 4: Check for similar emails
      const emailParts = email.split("@")
      const { data: similarEmails, error: similarError } = await supabase
        .from("trip_collaborators")
        .select("email")
        .ilike("email", `%${emailParts[0]}%`)

      results.similarEmails = { data: similarEmails, error: similarError }

      setQueryResults(results)
      console.log("Query test results:", results)
    } catch (error) {
      console.error("Query test error:", error)
    }
  }

  const createTestTrip = async () => {
    if (!user) return

    try {
      const testTrip = await tripsService.createTrip(
        {
          title: "Test Collaboration Trip",
          description: "This is a test trip to verify collaboration features",
          countries: ["France", "Italy"],
          cities: ["Paris", "Rome"],
          start_date: "2024-07-01",
          end_date: "2024-07-15",
        },
        [testEmail, "collaborator@example.com"], // Add both emails as collaborators
        user.id,
      )

      console.log("Test trip created:", testTrip)
      alert("Test trip created successfully!")
      loadDebugData()
    } catch (error) {
      console.error("Error creating test trip:", error)
      alert(`Error creating test trip: ${error}`)
    }
  }

  const createTestCollaboration = async () => {
    if (!testEmail || !supabase || trips.length === 0) return

    try {
      const { data, error } = await supabase
        .from("trip_collaborators")
        .insert({
          trip_id: trips[0].id,
          email: testEmail,
        })
        .select()

      console.log("Test collaboration created:", data)
      console.log("Error:", error)

      if (!error) {
        alert("Test collaboration created successfully!")
        loadDebugData()
      } else {
        alert(`Error creating collaboration: ${error.message}`)
      }
    } catch (error) {
      console.error("Test collaboration error:", error)
    }
  }

  const testEmailQuery = async () => {
    if (!testEmail) return
    await testCollaborationQueries(testEmail)
  }

  const testTripsService = async () => {
    if (!user) return

    try {
      console.log("Testing tripsService.getUserTrips...")
      const userTrips = await tripsService.getUserTrips(user.id, user.email)
      console.log("User trips result:", userTrips)
      alert(`Found ${userTrips.length} trips for user. Check console for details.`)
    } catch (error) {
      console.error("Error testing trips service:", error)
      alert(`Error testing trips service: ${error}`)
    }
  }

  if (loading) {
    return <div className="p-8">Loading debug data...</div>
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">🔍 Collaboration Debug</h1>

      <Card>
        <CardHeader>
          <CardTitle>Current User</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(user, null, 2)}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>LocalStorage Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Trips ({localStorageData.trips?.length || 0}):</h4>
              <pre className="bg-gray-100 p-2 rounded text-xs max-h-40 overflow-auto">
                {JSON.stringify(localStorageData.trips, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold">Invitations ({localStorageData.invitations?.length || 0}):</h4>
              <pre className="bg-gray-100 p-2 rounded text-xs max-h-40 overflow-auto">
                {JSON.stringify(localStorageData.invitations, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-2xl font-bold">{trips.length}</div>
              <div className="text-sm text-gray-600">Trips</div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="text-2xl font-bold">{collaborations.length}</div>
              <div className="text-sm text-gray-600">Collaborations</div>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <div className="text-2xl font-bold">{profiles.length}</div>
              <div className="text-sm text-gray-600">Profiles</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={createTestTrip} className="w-full">
              Create Test Trip with Collaborators
            </Button>
            <Button onClick={testTripsService} variant="outline" className="w-full">
              Test Trips Service
            </Button>
            <Button onClick={loadDebugData} variant="outline" className="w-full">
              Refresh All Data
            </Button>
            <Button
              onClick={createTestCollaboration}
              variant="outline"
              className="w-full"
              disabled={trips.length === 0}
            >
              Create Test Collaboration
            </Button>
          </div>
        </CardContent>
      </Card>

      {queryResults && (
        <Card>
          <CardHeader>
            <CardTitle>Query Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Direct Match (eq):</h4>
                <pre className="bg-gray-100 p-2 rounded text-xs">
                  {JSON.stringify(queryResults.directMatch, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold">Case Insensitive (ilike):</h4>
                <pre className="bg-gray-100 p-2 rounded text-xs">
                  {JSON.stringify(queryResults.iLikeMatch, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Input
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="Enter email to test"
          className="flex-1"
        />
        <Button onClick={testEmailQuery}>Test Email Queries</Button>
      </div>
    </div>
  )
}
