"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, ArrowLeft } from "lucide-react"
import { supabase, isSupabaseAvailable } from "@/lib/supabase"
import { authService } from "@/lib/auth"
import Link from "next/link"

interface TestResult {
  test: string
  status: "success" | "error" | "running"
  message: string
  details?: any
}

export default function TestDatabasePage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addResult = (result: TestResult) => {
    setResults((prev) => [...prev, result])
  }

  const runDatabaseTests = async () => {
    setIsRunning(true)
    setResults([])

    // Test 1: Environment Variables
    addResult({
      test: "Environment Variables",
      status: isSupabaseAvailable() ? "success" : "error",
      message: isSupabaseAvailable() ? "Supabase credentials found" : "Missing Supabase credentials",
    })

    if (!isSupabaseAvailable() || !supabase) {
      setIsRunning(false)
      return
    }

    // Test 2: Database Connection
    try {
      const { data, error } = await supabase.from("trips").select("count").limit(1)
      addResult({
        test: "Database Connection",
        status: error ? "error" : "success",
        message: error ? `Connection failed: ${error.message}` : "Successfully connected to database",
        details: error,
      })
    } catch (err: any) {
      addResult({
        test: "Database Connection",
        status: "error",
        message: `Connection error: ${err.message}`,
        details: err,
      })
    }

    // Test 3: Check Tables Exist
    try {
      const tables = ["profiles", "trips", "trip_collaborators"]
      for (const table of tables) {
        const { data, error } = await supabase.from(table).select("*").limit(1)
        addResult({
          test: `Table: ${table}`,
          status: error ? "error" : "success",
          message: error ? `Table error: ${error.message}` : `Table ${table} accessible`,
          details: error,
        })
      }
    } catch (err: any) {
      addResult({
        test: "Table Check",
        status: "error",
        message: `Table check failed: ${err.message}`,
        details: err,
      })
    }

    // Test 4: Current User
    try {
      const currentUser = await authService.getCurrentUser()
      addResult({
        test: "Current User",
        status: currentUser ? "success" : "error",
        message: currentUser ? `User found: ${currentUser.email}` : "No user found",
        details: currentUser,
      })

      // Test 5: User ID Format
      if (currentUser) {
        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          currentUser.id,
        )
        addResult({
          test: "User ID Format",
          status: isValidUUID ? "success" : "error",
          message: isValidUUID ? `Valid UUID: ${currentUser.id}` : `Invalid UUID format: ${currentUser.id}`,
          details: { userId: currentUser.id, isValidUUID },
        })

        // Test 6: Check if user exists in Supabase auth
        try {
          const { data: authUser, error: authError } = await supabase.auth.getUser()
          addResult({
            test: "Supabase Auth User",
            status: authError ? "error" : "success",
            message: authError
              ? `Auth error: ${authError.message}`
              : `Supabase auth user found: ${authUser.user?.email}`,
            details: authError || authUser,
          })

          // Test 7: Check if profiles table has current user (improved)
          if (authUser?.user && !authError) {
            try {
              const { data: profiles, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", authUser.user.id)

              if (profileError) {
                addResult({
                  test: "User Profile Exists",
                  status: "error",
                  message: `Profile query failed: ${profileError.message}`,
                  details: profileError,
                })
              } else if (!profiles || profiles.length === 0) {
                addResult({
                  test: "User Profile Exists",
                  status: "error",
                  message: `No profile found for user ${authUser.user.id}`,
                  details: { userId: authUser.user.id, profileCount: 0 },
                })

                // Try to create the missing profile
                try {
                  const { error: createError } = await supabase.rpc("create_profile_safely", {
                    user_id: authUser.user.id,
                    user_email: authUser.user.email || "",
                    user_name: authUser.user.user_metadata?.name || authUser.user.email?.split("@")[0] || "User",
                    user_role: authUser.user.user_metadata?.role || "traveler",
                  })

                  if (createError) {
                    addResult({
                      test: "Create Missing Profile",
                      status: "error",
                      message: `Failed to create profile: ${createError.message}`,
                      details: createError,
                    })
                  } else {
                    addResult({
                      test: "Create Missing Profile",
                      status: "success",
                      message: "Successfully created missing profile",
                    })
                  }
                } catch (createErr: any) {
                  addResult({
                    test: "Create Missing Profile",
                    status: "error",
                    message: `Profile creation failed: ${createErr.message}`,
                    details: createErr,
                  })
                }
              } else if (profiles.length === 1) {
                addResult({
                  test: "User Profile Exists",
                  status: "success",
                  message: "User profile exists in database",
                  details: profiles[0],
                })
              } else {
                addResult({
                  test: "User Profile Exists",
                  status: "error",
                  message: `Multiple profiles found for user: ${profiles.length}`,
                  details: profiles,
                })
              }
            } catch (err: any) {
              addResult({
                test: "User Profile Check",
                status: "error",
                message: `Profile check failed: ${err.message}`,
                details: err,
              })
            }

            // Test 8: Try Creating a Test Trip (only if profile exists)
            if (isValidUUID) {
              try {
                // First verify profile exists again
                const { data: profileCheck } = await supabase
                  .from("profiles")
                  .select("id")
                  .eq("id", authUser.user.id)
                  .single()

                if (profileCheck) {
                  const testTrip = {
                    user_id: authUser.user.id,
                    title: "Database Test Trip",
                    description: "Testing database connection",
                    countries: ["Test Country"],
                    cities: ["Test City"],
                    start_date: "2024-01-01",
                    end_date: "2024-01-07",
                    status: "planning",
                  }

                  console.log("Attempting to create test trip:", testTrip)

                  const { data: trip, error: tripError } = await supabase
                    .from("trips")
                    .insert(testTrip)
                    .select()
                    .single()

                  addResult({
                    test: "Create Test Trip",
                    status: tripError ? "error" : "success",
                    message: tripError
                      ? `Failed to create trip: ${tripError.message}`
                      : "Successfully created test trip",
                    details: tripError || trip,
                  })

                  // Clean up test trip
                  if (trip && !tripError) {
                    await supabase.from("trips").delete().eq("id", trip.id)
                    addResult({
                      test: "Cleanup Test Trip",
                      status: "success",
                      message: "Test trip cleaned up successfully",
                    })
                  }
                } else {
                  addResult({
                    test: "Create Test Trip",
                    status: "error",
                    message: "Cannot create trip: Profile does not exist",
                    details: { userId: authUser.user.id },
                  })
                }
              } catch (err: any) {
                addResult({
                  test: "Create Test Trip",
                  status: "error",
                  message: `Trip creation failed: ${err.message}`,
                  details: err,
                })
              }
            }
          }
        } catch (err: any) {
          addResult({
            test: "Supabase Auth User",
            status: "error",
            message: `Auth check failed: ${err.message}`,
            details: err,
          })
        }
      }
    } catch (err: any) {
      addResult({
        test: "User Check",
        status: "error",
        message: `User check failed: ${err.message}`,
        details: err,
      })
    }

    // Test 9: Check RLS Policies
    try {
      const { data, error } = await supabase.from("trips").select("*").limit(1)
      addResult({
        test: "RLS Policy Check",
        status: error ? "error" : "success",
        message: error ? `RLS blocking access: ${error.message}` : "RLS policies allow access",
        details: error,
      })
    } catch (err: any) {
      addResult({
        test: "RLS Policy Check",
        status: "error",
        message: `RLS check failed: ${err.message}`,
        details: err,
      })
    }

    setIsRunning(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Database Connection Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800">
                This test will check your database connection, tables, authentication, and RLS policies to find out why
                trips aren't saving.
              </AlertDescription>
            </Alert>

            <Button onClick={runDatabaseTests} disabled={isRunning} className="w-full">
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                "Run Database Tests"
              )}
            </Button>

            {results.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Test Results:</h3>
                {results.map((result, index) => (
                  <Alert
                    key={index}
                    className={
                      result.status === "success"
                        ? "bg-green-50 border-green-200"
                        : result.status === "error"
                          ? "bg-red-50 border-red-200"
                          : "bg-yellow-50 border-yellow-200"
                    }
                  >
                    <div className="flex items-start gap-2">
                      {result.status === "success" ? (
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      ) : result.status === "error" ? (
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      ) : (
                        <Loader2 className="h-4 w-4 text-yellow-600 mt-0.5 animate-spin" />
                      )}
                      <div className="flex-1">
                        <AlertDescription
                          className={
                            result.status === "success"
                              ? "text-green-800"
                              : result.status === "error"
                                ? "text-red-800"
                                : "text-yellow-800"
                          }
                        >
                          <strong>{result.test}:</strong> {result.message}
                        </AlertDescription>
                        {result.details && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm opacity-75">Show Details</summary>
                            <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
