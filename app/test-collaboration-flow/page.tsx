"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authService } from "@/lib/auth"
import { tripsService } from "@/lib/trips"
import { invitationsService } from "@/lib/invitations"
import { supabase } from "@/lib/supabase"

export default function TestCollaborationFlowPage() {
  const [user, setUser] = useState<any>(null)
  const [testEmail, setTestEmail] = useState("")
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const currentUser = await authService.getCurrentUser()
    setUser(currentUser)
    // Set a different default email for testing
    setTestEmail("test.collaborator@example.com")
  }

  const addTestResult = (step: string, success: boolean, data: any, error?: any) => {
    setTestResults((prev) => [
      ...prev,
      {
        step,
        success,
        data,
        error,
        timestamp: new Date().toISOString(),
      },
    ])
  }

  const testFullFlow = async () => {
    if (!user || !testEmail) return

    setLoading(true)
    setTestResults([])

    try {
      // Step 0: Check if collaborator has an account
      addTestResult("Starting test", true, { user: user.email, collaborator: testEmail })

      if (supabase) {
        console.log("Step 0: Checking if collaborator has an account...")
        const { data: collaboratorProfile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", testEmail)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          // PGRST116 is "not found" error, which is expected for new collaborators
          addTestResult("Check Collaborator Profile", false, null, profileError)
        } else if (collaboratorProfile) {
          addTestResult("Check Collaborator Profile", true, collaboratorProfile)
        } else {
          addTestResult("Check Collaborator Profile", true, { message: "No profile found (expected for new users)" })
        }
      }

      // Step 1: Create a trip with collaborator
      const tripData = {
        title: `Test Collaboration Flow ${Date.now()}`,
        description: "Testing the full collaboration flow",
        countries: ["Test Country"],
        cities: ["Test City"],
      }

      console.log("Step 1: Creating trip...")
      const trip = await tripsService.createTrip(tripData, [testEmail], user.id)
      addTestResult("Create Trip", true, trip)

      // Step 2: Verify trip was created in database
      console.log("Step 2: Verifying trip in database...")
      if (supabase) {
        const { data: dbTrip, error: dbError } = await supabase.from("trips").select("*").eq("id", trip.id).single()

        if (dbError) {
          addTestResult("Verify Trip in DB", false, null, dbError)
        } else {
          addTestResult("Verify Trip in DB", true, dbTrip)
        }

        // Step 3: Verify collaborator was added
        console.log("Step 3: Verifying collaborator in database...")
        const { data: collaborators, error: collabError } = await supabase
          .from("trip_collaborators")
          .select("*")
          .eq("trip_id", trip.id)

        if (collabError) {
          addTestResult("Verify Collaborators in DB", false, null, collabError)
        } else {
          addTestResult("Verify Collaborators in DB", true, collaborators)

          // Check if our test email is in the collaborators
          const hasTestEmail = collaborators.some((c: any) => c.email === testEmail)
          addTestResult("Test Email in Collaborators", hasTestEmail, { found: hasTestEmail, collaborators })
        }

        // Step 4: Test getUserTrips for the current user (should include collaborated trips)
        console.log("Step 4: Testing getUserTrips for current user...")
        try {
          const userTrips = await tripsService.getUserTrips(user.id, user.email)
          addTestResult("Get User Trips (current user)", true, userTrips)
        } catch (error) {
          addTestResult("Get User Trips (current user)", false, null, error)
        }

        // Step 5: Test direct collaboration query for test email
        console.log("Step 5: Testing direct collaboration query for test email...")
        const { data: directCollab, error: directError } = await supabase
          .from("trip_collaborators")
          .select(`
            *,
            trips (*)
          `)
          .eq("email", testEmail)

        if (directError) {
          addTestResult("Direct Collaboration Query", false, null, directError)
        } else {
          addTestResult("Direct Collaboration Query", true, directCollab)
        }

        // Step 6: Test what happens when a user with the test email tries to get trips
        console.log("Step 6: Simulating getUserTrips for collaborator email...")
        try {
          // This simulates what would happen if someone with testEmail logged in
          const collaboratorTrips = await tripsService.getUserTrips("fake-user-id", testEmail)
          addTestResult("Get Trips for Collaborator Email", true, collaboratorTrips)
        } catch (error) {
          addTestResult("Get Trips for Collaborator Email", false, null, error)
        }
      }

      // Step 7: Send invitation email
      console.log("Step 7: Sending invitation email...")
      try {
        const emailResult = await invitationsService.sendInvitationEmail(
          trip.id,
          trip.title,
          testEmail,
          user.name || user.email,
          user.email,
        )
        addTestResult("Send Invitation Email", emailResult, { emailSent: emailResult })
      } catch (emailError) {
        addTestResult("Send Invitation Email", false, null, emailError)
      }

      // Step 8: Test the invitation creation separately
      console.log("Step 8: Testing invitation creation...")
      try {
        const invitation = await invitationsService.createInvitation(trip.id, testEmail, user.email)
        addTestResult("Create Invitation Record", true, invitation)
      } catch (inviteError) {
        addTestResult("Create Invitation Record", false, null, inviteError)
      }
    } catch (error) {
      addTestResult("Test Flow Error", false, null, error)
    } finally {
      setLoading(false)
    }
  }

  const testEmailOnly = async () => {
    if (!testEmail) return

    setLoading(true)
    setTestResults([])

    try {
      console.log("Testing email sending only...")
      addTestResult("Testing Email Only", true, { email: testEmail })

      const emailResult = await invitationsService.sendInvitationEmail(
        "test-trip-id",
        "Test Trip Title",
        testEmail,
        user?.name || "Test User",
        user?.email || "test@example.com",
      )

      addTestResult("Send Test Email", emailResult, { emailSent: emailResult })
    } catch (error) {
      addTestResult("Send Test Email", false, null, error)
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">🧪 Test Collaboration Flow</h1>

      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Current User:</label>
            <div className="bg-gray-100 p-2 rounded text-sm">{user?.email || "Not logged in"}</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Test Collaborator Email:</label>
            <Input
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Enter email to test collaboration with"
              type="email"
            />
            <p className="text-xs text-gray-600 mt-1">
              💡 Try using an email that doesn't have an account yet to test the full flow
            </p>
          </div>

          <div className="flex gap-4">
            <Button onClick={testFullFlow} disabled={loading || !testEmail}>
              {loading ? "Testing..." : "Run Full Test"}
            </Button>
            <Button onClick={testEmailOnly} disabled={loading || !testEmail} variant="outline">
              Test Email Only
            </Button>
            <Button onClick={clearResults} variant="outline">
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <Alert
                  key={index}
                  className={result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}
                >
                  <AlertDescription>
                    <div className="font-semibold mb-2">
                      {result.success ? "✅" : "❌"} {result.step}
                    </div>
                    {result.data && (
                      <details className="mb-2">
                        <summary className="cursor-pointer text-sm font-medium">Data</summary>
                        <pre className="bg-gray-100 p-2 rounded text-xs mt-1 overflow-auto max-h-40">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                    {result.error && (
                      <details>
                        <summary className="cursor-pointer text-sm font-medium text-red-600">Error Details</summary>
                        <pre className="bg-red-100 p-2 rounded text-xs mt-1 overflow-auto max-h-40">
                          {JSON.stringify(result.error, null, 2)}
                        </pre>
                      </details>
                    )}
                    <div className="text-xs text-gray-500 mt-1">{result.timestamp}</div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
