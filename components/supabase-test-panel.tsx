"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

export function SupabaseTestPanel() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (message: string) => {
    console.log("TEST:", message)
    setTestResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runComprehensiveTest = async () => {
    setIsLoading(true)
    setTestResults([])

    try {
      addResult("=== STARTING COMPREHENSIVE SUPABASE TEST ===")

      // Test 1: Basic connection
      addResult("🔌 Testing basic connection...")
      try {
        const { data, error } = await supabase.from("profiles").select("count").limit(1)
        if (error) {
          addResult(`❌ Basic connection failed: ${error.message}`)
          return
        }
        addResult("✅ Basic connection successful")
      } catch (error: any) {
        addResult(`❌ Connection error: ${error.message}`)
        return
      }

      // Test 2: Authentication status
      addResult("🔑 Checking authentication...")
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError) {
          addResult(`❌ Auth error: ${authError.message}`)
        } else if (authData?.user) {
          addResult(`✅ Authenticated as: ${authData.user.email} (${authData.user.id})`)
        } else {
          addResult("⚠️ No authenticated user")
        }
      } catch (error: any) {
        addResult(`❌ Auth check failed: ${error.message}`)
      }

      // Test 3: Check trips table structure
      addResult("📋 Checking trips table structure...")
      try {
        const { data, error } = await supabase.from("trips").select("*").limit(0)
        if (error) {
          addResult(`❌ Trips table access failed: ${error.message}`)
          addResult(`Error details: ${JSON.stringify(error)}`)
        } else {
          addResult("✅ Trips table accessible")
        }
      } catch (error: any) {
        addResult(`❌ Trips table error: ${error.message}`)
      }

      // Test 4: Try to read existing trips
      addResult("📖 Reading existing trips...")
      try {
        const { data: trips, error } = await supabase.from("trips").select("id, title, user_id, created_at").limit(5)
        if (error) {
          addResult(`❌ Reading trips failed: ${error.message}`)
        } else {
          addResult(`✅ Found ${trips?.length || 0} existing trips`)
          if (trips && trips.length > 0) {
            trips.forEach((trip) => {
              addResult(`  - ${trip.title} (${trip.id}) by ${trip.user_id}`)
            })
          }
        }
      } catch (error: any) {
        addResult(`❌ Read error: ${error.message}`)
      }

      // Test 5: Try a simple insert
      addResult("✏️ Testing simple insert...")
      const testTrip = {
        title: `Test Trip ${Date.now()}`,
        description: "Test from debug panel",
        user_id: "test-user-123", // Use a simple test user ID
      }

      try {
        const { data: insertResult, error: insertError } = await supabase
          .from("trips")
          .insert(testTrip)
          .select()
          .single()

        if (insertError) {
          addResult(`❌ Insert failed: ${insertError.message}`)
          addResult(`Error code: ${insertError.code}`)
          addResult(`Error details: ${JSON.stringify(insertError)}`)

          // Try without select
          addResult("🔄 Trying insert without select...")
          const { error: simpleInsertError } = await supabase.from("trips").insert(testTrip)

          if (simpleInsertError) {
            addResult(`❌ Simple insert also failed: ${simpleInsertError.message}`)
          } else {
            addResult("✅ Simple insert worked (no data returned)")
          }
        } else {
          addResult(`✅ Insert successful! Trip ID: ${insertResult.id}`)

          // Clean up the test trip
          const { error: deleteError } = await supabase.from("trips").delete().eq("id", insertResult.id)
          if (deleteError) {
            addResult(`⚠️ Could not clean up test trip: ${deleteError.message}`)
          } else {
            addResult("🧹 Test trip cleaned up")
          }
        }
      } catch (error: any) {
        addResult(`❌ Insert exception: ${error.message}`)
      }

      // Test 6: Check environment variables
      addResult("🌍 Checking environment...")
      addResult(`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}`)
      addResult(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}`)

      // Test 7: Check RLS policies
      addResult("🔒 Checking RLS status...")
      try {
        const { data: rlsData, error: rlsError } = await supabase.rpc("check_rls_status")
        if (rlsError) {
          addResult(`⚠️ Could not check RLS: ${rlsError.message}`)
        } else {
          addResult(`RLS data: ${JSON.stringify(rlsData)}`)
        }
      } catch (error: any) {
        addResult(`⚠️ RLS check failed: ${error.message}`)
      }

      addResult("=== TEST COMPLETE ===")
    } catch (error: any) {
      addResult(`❌ Test failed with exception: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testDirectInsert = async () => {
    setIsLoading(true)
    addResult("=== TESTING DIRECT INSERT ===")

    try {
      // Get current user first
      const { data: authData } = await supabase.auth.getUser()
      const userId = authData?.user?.id || "anonymous-user"

      addResult(`Using user ID: ${userId}`)

      const tripData = {
        title: `Direct Test Trip ${Date.now()}`,
        description: "Testing direct insertion",
        start_date: "2024-07-01",
        end_date: "2024-07-10",
        user_id: userId,
        status: "planning",
      }

      addResult(`Inserting: ${JSON.stringify(tripData)}`)

      const { data, error } = await supabase.from("trips").insert(tripData).select().single()

      if (error) {
        addResult(`❌ Direct insert failed: ${error.message}`)
        addResult(`Error code: ${error.code}`)
        addResult(`Error hint: ${error.hint || "No hint"}`)
        addResult(`Error details: ${JSON.stringify(error.details)}`)
      } else {
        addResult(`✅ Direct insert successful!`)
        addResult(`Created trip: ${JSON.stringify(data)}`)
      }
    } catch (error: any) {
      addResult(`❌ Exception during direct insert: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runComprehensiveTest} disabled={isLoading}>
            {isLoading ? "Testing..." : "Run Comprehensive Test"}
          </Button>
          <Button onClick={testDirectInsert} disabled={isLoading} variant="outline">
            Test Direct Insert
          </Button>
          <Button onClick={() => setTestResults([])} variant="ghost">
            Clear Results
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            <div className="text-xs font-mono space-y-1 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={
                    result.includes("❌") ? "text-red-600" : result.includes("✅") ? "text-green-600" : "text-gray-700"
                  }
                >
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
