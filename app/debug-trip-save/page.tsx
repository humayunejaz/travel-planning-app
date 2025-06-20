"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "@/lib/auth"
import { tripsService } from "@/lib/trips"
import { supabase } from "@/lib/supabase"

export default function DebugTripSavePage() {
  const [logs, setLogs] = useState<string[]>([])
  const [testTitle, setTestTitle] = useState("Debug Test Trip")
  const [isLoading, setIsLoading] = useState(false)

  const addLog = (message: string) => {
    console.log(message)
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testTripCreation = async () => {
    setIsLoading(true)
    setLogs([])

    try {
      addLog("🚀 Starting trip creation test...")

      // 1. Check authentication
      addLog("1️⃣ Checking authentication...")
      const user = await authService.getCurrentUser()
      if (!user) {
        addLog("❌ No authenticated user found")
        return
      }
      addLog(`✅ User authenticated: ${user.email} (ID: ${user.id})`)

      // 2. Check Supabase connection
      addLog("2️⃣ Testing Supabase connection...")
      try {
        const { data, error } = await supabase.from("profiles").select("count").limit(1)
        if (error) {
          addLog(`❌ Supabase connection error: ${error.message}`)
        } else {
          addLog("✅ Supabase connection working")
        }
      } catch (err: any) {
        addLog(`❌ Supabase connection failed: ${err.message}`)
      }

      // 3. Check user profile exists
      addLog("3️⃣ Checking user profile...")
      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError || !profile) {
          addLog(`❌ Profile not found: ${profileError?.message}`)
          addLog("🔧 Attempting to create profile...")

          const { error: createError } = await supabase.rpc("create_profile_safely", {
            user_id: user.id,
            user_email: user.email,
            user_name: user.name || user.email.split("@")[0],
            user_role: "traveler",
          })

          if (createError) {
            addLog(`❌ Failed to create profile: ${createError.message}`)
          } else {
            addLog("✅ Profile created successfully")
          }
        } else {
          addLog(`✅ Profile exists: ${profile.email} (${profile.role})`)
        }
      } catch (err: any) {
        addLog(`❌ Profile check failed: ${err.message}`)
      }

      // 4. Test direct database insert
      addLog("4️⃣ Testing direct database insert...")
      try {
        const tripData = {
          user_id: user.id,
          title: `${testTitle} - Direct DB`,
          description: "Direct database test",
          status: "planning",
          countries: ["Test Country"],
          cities: ["Test City"],
        }

        addLog(`📝 Inserting trip: ${JSON.stringify(tripData)}`)

        const { data: dbTrip, error: insertError } = await supabase.from("trips").insert(tripData).select().single()

        if (insertError) {
          addLog(`❌ Direct insert failed: ${insertError.message}`)
          addLog(`Error code: ${insertError.code}`)
          addLog(`Error details: ${insertError.details}`)
          addLog(`Error hint: ${insertError.hint}`)
        } else {
          addLog(`✅ Direct insert successful: ${dbTrip.id}`)

          // Clean up test trip
          await supabase.from("trips").delete().eq("id", dbTrip.id)
          addLog("🧹 Test trip cleaned up")
        }
      } catch (err: any) {
        addLog(`❌ Direct insert error: ${err.message}`)
      }

      // 5. Test via tripsService
      addLog("5️⃣ Testing via tripsService...")
      try {
        const serviceTrip = await tripsService.createTrip(
          {
            title: `${testTitle} - Service`,
            description: "Service test",
            countries: ["Service Country"],
            cities: ["Service City"],
          },
          [],
          user.id,
        )

        addLog(`✅ Service creation successful: ${serviceTrip.id}`)

        // Check if it's in database
        const { data: checkTrip, error: checkError } = await supabase
          .from("trips")
          .select("*")
          .eq("id", serviceTrip.id)
          .single()

        if (checkError) {
          addLog(`❌ Trip not found in database: ${checkError.message}`)
        } else {
          addLog(`✅ Trip confirmed in database: ${checkTrip.title}`)
        }
      } catch (err: any) {
        addLog(`❌ Service creation failed: ${err.message}`)
      }

      addLog("🏁 Test completed!")
    } catch (error: any) {
      addLog(`❌ Test failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Debug Trip Save Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testTitle">Test Trip Title</Label>
              <Input
                id="testTitle"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="Enter test trip title"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={testTripCreation} disabled={isLoading}>
                {isLoading ? "Running Test..." : "🧪 Run Trip Save Test"}
              </Button>
              <Button variant="outline" onClick={clearLogs}>
                Clear Logs
              </Button>
            </div>

            {logs.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Test Results:</h3>
                <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
                  {logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
