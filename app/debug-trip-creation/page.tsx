"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, User, LogIn } from "lucide-react"
import { supabase, isSupabaseAvailable } from "@/lib/supabase"
import { authService } from "@/lib/auth"
import { tripsService } from "@/lib/trips"

export default function DebugTripCreationPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [tripTitle, setTripTitle] = useState("Test Trip " + Date.now())
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Auth form states
  const [email, setEmail] = useState("test@example.com")
  const [password, setPassword] = useState("password123")
  const [name, setName] = useState("Test User")

  const addResult = (message: string) => {
    console.log(message)
    setResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const clearResults = () => {
    setResults([])
  }

  // Check auth status on load
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    setAuthLoading(true)
    try {
      const user = await authService.getCurrentUser()
      setCurrentUser(user)

      if (user) {
        addResult(`✅ Authenticated as: ${user.email} (ID: ${user.id})`)
      } else {
        addResult("❌ Not authenticated")
      }
    } catch (error: any) {
      addResult(`❌ Auth check error: ${error.message}`)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignUp = async () => {
    setLoading(true)
    clearResults()

    try {
      addResult("🔐 Attempting sign up...")
      const result = await authService.signUp(email, password, name, "traveler")

      if (result.user) {
        addResult(`✅ Sign up successful: ${result.user.email}`)
        setCurrentUser(result.user)
      } else {
        addResult("❌ Sign up failed - no user returned")
      }
    } catch (error: any) {
      addResult(`❌ Sign up error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async () => {
    setLoading(true)
    clearResults()

    try {
      addResult("🔐 Attempting sign in...")
      const result = await authService.signIn(email, password)

      if (result.user) {
        addResult(`✅ Sign in successful: ${result.user.email}`)
        setCurrentUser(result.user)
      } else {
        addResult("❌ Sign in failed - no user returned")
      }
    } catch (error: any) {
      addResult(`❌ Sign in error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await authService.signOut()
      setCurrentUser(null)
      addResult("✅ Signed out successfully")
    } catch (error: any) {
      addResult(`❌ Sign out error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testDatabaseConnection = async () => {
    setLoading(true)
    clearResults()

    try {
      addResult("🔍 Testing database connection...")

      if (!isSupabaseAvailable()) {
        addResult("❌ Supabase not available - check environment variables")
        return
      }

      if (!supabase) {
        addResult("❌ Supabase client not initialized")
        return
      }

      // Test basic connection (no auth required)
      const { data, error } = await supabase.from("profiles").select("count").limit(1)
      if (error) {
        addResult(`❌ Database connection failed: ${error.message}`)
        return
      }

      addResult("✅ Database connection successful")

      // Test auth session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        addResult(`❌ Session error: ${sessionError.message}`)
      } else if (sessionData.session) {
        addResult(`✅ Active session found for: ${sessionData.session.user.email}`)

        // Test user access
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError) {
          addResult(`❌ Auth user error: ${authError.message}`)
        } else if (authData.user) {
          addResult(`✅ Auth user: ${authData.user.email} (ID: ${authData.user.id})`)

          // Check profile
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authData.user.id)
            .single()

          if (profileError) {
            addResult(`❌ Profile query error: ${profileError.message}`)
          } else if (profile) {
            addResult(`✅ Profile exists: ${profile.name} (${profile.email})`)
          } else {
            addResult("❌ No profile found")
          }

          // Test trips access
          const { data: tripsData, error: tripsError } = await supabase
            .from("trips")
            .select("*")
            .eq("user_id", authData.user.id)

          if (tripsError) {
            addResult(`❌ Trips query error: ${tripsError.message}`)
          } else {
            addResult(`✅ Trips accessible: found ${tripsData?.length || 0} trips`)
            tripsData?.forEach((trip, index) => {
              addResult(`  ${index + 1}. ${trip.title} (${trip.id})`)
            })
          }
        }
      } else {
        addResult("❌ No active session - user needs to sign in")
      }
    } catch (error: any) {
      addResult(`❌ Unexpected error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testTripCreation = async () => {
    setLoading(true)
    clearResults()

    try {
      addResult("🚀 Testing trip creation...")

      if (!currentUser) {
        addResult("❌ No authenticated user - please sign in first")
        return
      }

      addResult(`✅ Using authenticated user: ${currentUser.email} (ID: ${currentUser.id})`)

      // Test direct database insert first
      if (supabase) {
        addResult("💾 Testing direct database insert...")

        const tripData = {
          user_id: currentUser.id,
          title: tripTitle,
          description: "Test trip description",
          countries: ["Test Country"],
          cities: ["Test City"],
          start_date: "2024-06-01",
          end_date: "2024-06-10",
          status: "planning",
        }

        addResult(`Inserting: ${JSON.stringify(tripData, null, 2)}`)

        const { data: insertedTrip, error: insertError } = await supabase
          .from("trips")
          .insert(tripData)
          .select()
          .single()

        if (insertError) {
          addResult(`❌ Direct insert failed: ${insertError.message}`)
          addResult(`Error code: ${insertError.code}`)
          addResult(`Error details: ${insertError.details}`)
          addResult(`Error hint: ${insertError.hint}`)
        } else {
          addResult(`✅ Direct insert successful!`)
          addResult(`Created trip: ${insertedTrip.title} (ID: ${insertedTrip.id})`)
        }
      }

      // Test using trips service
      addResult("🔧 Testing trips service...")

      const serviceTrip = await tripsService.createTrip(
        {
          title: tripTitle + " (Service)",
          description: "Test trip via service",
          countries: ["Service Country"],
          cities: ["Service City"],
          start_date: "2024-07-01",
          end_date: "2024-07-10",
        },
        [],
        currentUser.id,
      )

      addResult(`✅ Service trip created: ${serviceTrip.title} (ID: ${serviceTrip.id})`)

      // Verify all trips
      if (supabase) {
        const { data: allTrips, error: queryError } = await supabase
          .from("trips")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })

        if (queryError) {
          addResult(`❌ Query error: ${queryError.message}`)
        } else {
          addResult(`✅ Total trips in database: ${allTrips?.length || 0}`)
          allTrips?.forEach((trip, index) => {
            addResult(`  ${index + 1}. ${trip.title} (ID: ${trip.id})`)
          })
        }
      }
    } catch (error: any) {
      addResult(`❌ Trip creation error: ${error.message}`)
      console.error("Full error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Auth Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Authentication Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentUser ? (
              <div className="space-y-2">
                <p className="text-green-600 font-medium">✅ Signed in as: {currentUser.email}</p>
                <p className="text-sm text-gray-600">User ID: {currentUser.id}</p>
                <p className="text-sm text-gray-600">Role: {currentUser.role}</p>
                <Button variant="outline" onClick={handleSignOut} disabled={loading}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-red-600 font-medium">❌ Not authenticated - please sign in to test trip creation</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSignIn} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
                    Sign In
                  </Button>
                  <Button variant="outline" onClick={handleSignUp} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Sign Up
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Tools Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🔧 Trip Creation Debug Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tripTitle">Test Trip Title</Label>
              <Input
                id="tripTitle"
                value={tripTitle}
                onChange={(e) => setTripTitle(e.target.value)}
                placeholder="Enter test trip title"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button onClick={testDatabaseConnection} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Test Database Connection
              </Button>

              <Button
                onClick={testTripCreation}
                disabled={loading || !currentUser}
                variant={currentUser ? "default" : "secondary"}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Test Trip Creation
                {!currentUser && " (Sign in required)"}
              </Button>

              <Button variant="outline" onClick={clearResults}>
                Clear Results
              </Button>
            </div>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>🔍 Debug Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Alert className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Issue Found:</strong> You need to be authenticated to create trips. Please sign in first, then test
            trip creation. The auth session was missing, which is why trips weren't being saved to Supabase.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
