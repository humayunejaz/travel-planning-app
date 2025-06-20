"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { tripsService } from "@/lib/trips"
import { authService } from "@/lib/auth"

export default function TestCollaboratorsPage() {
  const [results, setResults] = useState<string[]>([])
  const [testTripId, setTestTripId] = useState("")
  const [testEmail, setTestEmail] = useState("collaborator@example.com")
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (message: string) => {
    setResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testCollaboratorFlow = async () => {
    setIsLoading(true)
    setResults([])

    try {
      addResult("🧪 Starting collaborator test...")

      // Get current user
      const user = await authService.getCurrentUser()
      if (!user) {
        addResult("❌ No authenticated user found")
        return
      }
      addResult(`✅ Authenticated as: ${user.email}`)

      // Create a test trip with collaborators
      addResult("📝 Creating test trip with collaborator...")
      const testTrip = await tripsService.createTrip(
        {
          title: "Collaborator Test Trip",
          description: "Testing collaborator functionality",
          start_date: "2024-06-01",
          end_date: "2024-06-10",
        },
        [testEmail], // Add collaborator during creation
        user.id,
      )

      addResult(`✅ Trip created with ID: ${testTrip.id}`)
      setTestTripId(testTrip.id)

      // Check if collaborator was saved to database
      if (supabase) {
        const { data: collaborators, error } = await supabase
          .from("trip_collaborators")
          .select("*")
          .eq("trip_id", testTrip.id)

        if (error) {
          addResult(`❌ Error fetching collaborators: ${error.message}`)
        } else {
          addResult(`📊 Found ${collaborators?.length || 0} collaborators in database`)
          collaborators?.forEach((collab, index) => {
            addResult(`   ${index + 1}. ${collab.email} (ID: ${collab.id})`)
          })
        }
      }

      // Test updating trip with new collaborators
      addResult("🔄 Testing collaborator update...")
      const newCollaborators = [testEmail, "second@example.com"]

      await tripsService.updateTrip(testTrip.id, { title: "Updated Collaborator Test Trip" }, newCollaborators)

      addResult("✅ Trip updated with new collaborators")

      // Check updated collaborators
      if (supabase) {
        const { data: updatedCollaborators, error } = await supabase
          .from("trip_collaborators")
          .select("*")
          .eq("trip_id", testTrip.id)

        if (error) {
          addResult(`❌ Error fetching updated collaborators: ${error.message}`)
        } else {
          addResult(`📊 After update: ${updatedCollaborators?.length || 0} collaborators`)
          updatedCollaborators?.forEach((collab, index) => {
            addResult(`   ${index + 1}. ${collab.email}`)
          })
        }
      }
    } catch (error: any) {
      addResult(`❌ Test failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const checkSpecificTrip = async () => {
    if (!testTripId) {
      addResult("❌ Please enter a trip ID")
      return
    }

    setIsLoading(true)
    try {
      addResult(`🔍 Checking collaborators for trip: ${testTripId}`)

      if (supabase) {
        const { data: collaborators, error } = await supabase
          .from("trip_collaborators")
          .select("*")
          .eq("trip_id", testTripId)

        if (error) {
          addResult(`❌ Error: ${error.message}`)
        } else {
          addResult(`📊 Found ${collaborators?.length || 0} collaborators`)
          collaborators?.forEach((collab, index) => {
            addResult(`   ${index + 1}. ${collab.email} (Created: ${new Date(collab.created_at).toLocaleString()})`)
          })
        }

        // Also check via trips service
        const trip = await tripsService.getTripById(testTripId)
        if (trip) {
          addResult(`🎯 Trips service shows ${trip.collaborators?.length || 0} collaborators`)
          trip.collaborators?.forEach((email, index) => {
            addResult(`   ${index + 1}. ${email}`)
          })
        } else {
          addResult("❌ Trip not found via trips service")
        }
      }
    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const viewAllCollaborators = async () => {
    setIsLoading(true)
    try {
      addResult("📋 Fetching all trip collaborators from database...")

      if (supabase) {
        const { data: allCollaborators, error } = await supabase
          .from("trip_collaborators")
          .select(`
            id,
            trip_id,
            email,
            created_at,
            trips (
              title,
              user_id
            )
          `)
          .order("created_at", { ascending: false })

        if (error) {
          addResult(`❌ Error: ${error.message}`)
        } else {
          addResult(`📊 Total collaborators in database: ${allCollaborators?.length || 0}`)
          allCollaborators?.forEach((collab, index) => {
            const tripTitle = (collab as any).trips?.title || "Unknown Trip"
            addResult(`   ${index + 1}. ${collab.email} → "${tripTitle}" (${collab.trip_id})`)
          })
        }
      }
    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Trip Collaborator Testing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={testCollaboratorFlow} disabled={isLoading} className="w-full">
                {isLoading ? "Testing..." : "🚀 Run Full Test"}
              </Button>

              <Button onClick={viewAllCollaborators} disabled={isLoading} variant="outline" className="w-full">
                📋 View All Collaborators
              </Button>

              <Button onClick={() => setResults([])} variant="outline" className="w-full">
                🗑️ Clear Results
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Test Email:</label>
              <Input
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="collaborator@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Check Specific Trip ID:</label>
              <div className="flex gap-2">
                <Input
                  value={testTripId}
                  onChange={(e) => setTestTripId(e.target.value)}
                  placeholder="Enter trip ID to check"
                />
                <Button onClick={checkSpecificTrip} disabled={isLoading}>
                  🔍 Check
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📊 Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <div className="text-gray-500">No tests run yet. Click a button above to start testing.</div>
              ) : (
                results.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Alert>
          <AlertDescription>
            <strong>How to use:</strong>
            <br />
            1. Click "Run Full Test" to create a trip with collaborators and test the full flow
            <br />
            2. Click "View All Collaborators" to see all collaborators in your database
            <br />
            3. Enter a specific trip ID and click "Check" to inspect its collaborators
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
