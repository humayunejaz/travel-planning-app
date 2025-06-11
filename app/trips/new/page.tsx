"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, X, Plane, MapPin, Calendar, Users } from "lucide-react"
import { authService } from "@/lib/auth"
import { tripsService } from "@/lib/trips"

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function NewTripPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [tripData, setTripData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    countries: [] as string[],
    cities: [] as string[],
    collaborators: [] as string[],
  })
  const [newCountry, setNewCountry] = useState("")
  const [newCity, setNewCity] = useState("")
  const [newCollaborator, setNewCollaborator] = useState("")
  const router = useRouter()

  const addDebugInfo = (info: string) => {
    console.log("DEBUG:", info)
    setDebugInfo((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${info}`])
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        addDebugInfo("Checking authentication for new trip page...")
        const currentUser = await authService.getCurrentUser()
        addDebugInfo(`Current user: ${currentUser ? currentUser.email : "null"}`)

        if (!currentUser) {
          addDebugInfo("No user found, redirecting to login")
          router.push("/")
          return
        }

        if (currentUser.role === "agency") {
          addDebugInfo("Agency user, redirecting to agency dashboard")
          router.push("/agency")
          return
        }

        setIsAuthenticated(true)
        setUser(currentUser)
        addDebugInfo("Authentication successful")
      } catch (error) {
        addDebugInfo(`Auth check error: ${error}`)
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const addCountry = () => {
    if (newCountry.trim() && !tripData.countries.includes(newCountry.trim())) {
      setTripData({
        ...tripData,
        countries: [...tripData.countries, newCountry.trim()],
      })
      setNewCountry("")
    }
  }

  const removeCountry = (country: string) => {
    setTripData({
      ...tripData,
      countries: tripData.countries.filter((c) => c !== country),
    })
  }

  const addCity = () => {
    if (newCity.trim() && !tripData.cities.includes(newCity.trim())) {
      setTripData({
        ...tripData,
        cities: [...tripData.cities, newCity.trim()],
      })
      setNewCity("")
    }
  }

  const removeCity = (city: string) => {
    setTripData({
      ...tripData,
      cities: tripData.cities.filter((c) => c !== city),
    })
  }

  const addCollaborator = () => {
    if (newCollaborator.trim() && !tripData.collaborators.includes(newCollaborator.trim())) {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (emailRegex.test(newCollaborator.trim())) {
        setTripData({
          ...tripData,
          collaborators: [...tripData.collaborators, newCollaborator.trim()],
        })
        setNewCollaborator("")
        setError("")
      } else {
        setError("Please enter a valid email address")
      }
    }
  }

  const removeCollaborator = (email: string) => {
    setTripData({
      ...tripData,
      collaborators: tripData.collaborators.filter((c) => c !== email),
    })
  }

  const testDatabaseConnection = async () => {
    addDebugInfo("=== TESTING DATABASE CONNECTION ===")
    try {
      const { supabase } = await import("@/lib/supabase")

      // Test basic connection
      const { data: connectionTest, error: connectionError } = await supabase.from("profiles").select("count").limit(1)

      if (connectionError) {
        addDebugInfo(`❌ Connection test failed: ${connectionError.message}`)
        return false
      }

      addDebugInfo("✅ Basic connection OK")

      // Test auth
      const { data: authData } = await supabase.auth.getUser()
      addDebugInfo(`🔑 Auth user: ${authData?.user?.id || "none"}`)

      // Test trips table access
      const { data: tripsTest, error: tripsError } = await supabase.from("trips").select("count").limit(1)

      if (tripsError) {
        addDebugInfo(`❌ Trips table access failed: ${tripsError.message}`)
        return false
      }

      addDebugInfo("✅ Trips table access OK")

      // Test simple insertion
      const testTrip = {
        title: `Test Trip ${Date.now()}`,
        description: "Test description",
        user_id: user?.id || "test-user-id",
      }

      addDebugInfo(`🧪 Testing insertion with: ${JSON.stringify(testTrip)}`)

      const { data: insertTest, error: insertError } = await supabase.from("trips").insert(testTrip).select().single()

      if (insertError) {
        addDebugInfo(`❌ Test insertion failed: ${insertError.message}`)
        addDebugInfo(`Error details: ${JSON.stringify(insertError)}`)
        return false
      }

      addDebugInfo(`✅ Test insertion successful: ${insertTest.id}`)

      // Clean up test trip
      await supabase.from("trips").delete().eq("id", insertTest.id)
      addDebugInfo("🧹 Test trip cleaned up")

      return true
    } catch (error: any) {
      addDebugInfo(`❌ Database test error: ${error.message}`)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSaving(true)
    setDebugInfo([]) // Clear previous debug info

    addDebugInfo("=== STARTING TRIP CREATION ===")

    try {
      // Validation
      if (!tripData.title || !tripData.startDate || !tripData.endDate) {
        addDebugInfo("Validation failed: missing required fields")
        setError("Please fill in all required fields")
        setIsSaving(false)
        return
      }

      if (!user) {
        addDebugInfo("Validation failed: no user")
        setError("User not authenticated")
        setIsSaving(false)
        return
      }

      addDebugInfo(`User validated: ${user.email} (${user.id})`)

      // Test database connection first
      const dbWorking = await testDatabaseConnection()
      addDebugInfo(`Database test result: ${dbWorking ? "PASS" : "FAIL"}`)

      // Create the trip object
      const tripToCreate = {
        title: tripData.title,
        description: tripData.description,
        start_date: tripData.startDate,
        end_date: tripData.endDate,
        countries: tripData.countries,
        cities: tripData.cities,
      }

      addDebugInfo(`Trip data: ${JSON.stringify(tripToCreate)}`)
      addDebugInfo("Calling tripsService.createTrip...")

      // Create new trip with timeout
      const createTripPromise = tripsService.createTrip(tripToCreate, tripData.collaborators, user.id)

      // Add a timeout to prevent infinite waiting
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Trip creation timed out after 15 seconds")), 15000)
      })

      const createdTrip = await Promise.race([createTripPromise, timeoutPromise])

      addDebugInfo(`Trip created successfully: ${JSON.stringify(createdTrip)}`)

      // Show success message
      if (tripData.collaborators.length > 0) {
        addDebugInfo(`Showing success message for ${tripData.collaborators.length} collaborators`)
        // Show a brief success message
        const successDiv = document.createElement("div")
        successDiv.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #10b981;
          color: white;
          padding: 16px 24px;
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          z-index: 10000;
          font-family: system-ui, -apple-system, sans-serif;
        `
        successDiv.innerHTML = `
          <div style="display: flex; align-items: center;">
            <div style="font-size: 20px; margin-right: 12px;">✅</div>
            <div>
              <div style="font-weight: 600; margin-bottom: 4px;">Trip Created!</div>
              <div style="font-size: 14px; opacity: 0.9;">Invitations sent to ${tripData.collaborators.length} collaborator(s)</div>
            </div>
          </div>
        `
        document.body.appendChild(successDiv)

        // Remove notification after 3 seconds
        setTimeout(() => {
          if (successDiv.parentNode) {
            successDiv.remove()
          }
        }, 3000)
      }

      addDebugInfo("Redirecting to dashboard...")

      // Force redirect using window.location as backup
      try {
        router.push("/dashboard")
        // Backup redirect after 1 second
        setTimeout(() => {
          if (window.location.pathname !== "/dashboard") {
            addDebugInfo("Router.push failed, using window.location")
            window.location.href = "/dashboard"
          }
        }, 1000)
      } catch (routerError) {
        addDebugInfo(`Router error: ${routerError}`)
        window.location.href = "/dashboard"
      }
    } catch (error: any) {
      addDebugInfo(`Error creating trip: ${error.message || error}`)
      console.error("Error creating trip:", error)
      setError(`Failed to create trip: ${error.message || "Unknown error"}`)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center ml-4">
              <Plane className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">Create New Trip</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

        {/* Debug Panel */}
        {debugInfo.length > 0 && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-sm">Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-1 max-h-60 overflow-y-auto">
                {debugInfo.map((info, index) => (
                  <div key={index} className="font-mono">
                    {info}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Trip Details
              </CardTitle>
              <CardDescription>Basic information about your trip</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Trip Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., European Summer Adventure"
                  value={tripData.title}
                  onChange={(e) => setTripData({ ...tripData, title: e.target.value })}
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your trip plans..."
                  value={tripData.description}
                  onChange={(e) => setTripData({ ...tripData, description: e.target.value })}
                  rows={3}
                  disabled={isSaving}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={tripData.startDate}
                    onChange={(e) => setTripData({ ...tripData, startDate: e.target.value })}
                    required
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={tripData.endDate}
                    onChange={(e) => setTripData({ ...tripData, endDate: e.target.value })}
                    required
                    disabled={isSaving}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Destinations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Destinations
              </CardTitle>
              <CardDescription>Add countries and cities you plan to visit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Countries */}
              <div className="space-y-3">
                <Label>Countries</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a country"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCountry())}
                    disabled={isSaving}
                  />
                  <Button type="button" onClick={addCountry} disabled={isSaving}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tripData.countries.map((country) => (
                    <Badge key={country} variant="secondary" className="flex items-center gap-1">
                      {country}
                      <button
                        type="button"
                        onClick={() => removeCountry(country)}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        disabled={isSaving}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Cities */}
              <div className="space-y-3">
                <Label>Cities</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a city"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCity())}
                    disabled={isSaving}
                  />
                  <Button type="button" onClick={addCity} disabled={isSaving}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tripData.cities.map((city) => (
                    <Badge key={city} variant="outline" className="flex items-center gap-1">
                      {city}
                      <button
                        type="button"
                        onClick={() => removeCity(city)}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        disabled={isSaving}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Collaborators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Collaborators
              </CardTitle>
              <CardDescription>Invite others to help plan this trip</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email address"
                  type="email"
                  value={newCollaborator}
                  onChange={(e) => setNewCollaborator(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCollaborator())}
                  disabled={isSaving}
                />
                <Button type="button" onClick={addCollaborator} disabled={isSaving}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tripData.collaborators.map((email) => (
                  <Badge key={email} className="flex items-center gap-1">
                    {email}
                    <button
                      type="button"
                      onClick={() => removeCollaborator(email)}
                      className="ml-1 hover:bg-blue-700 rounded-full p-0.5"
                      disabled={isSaving}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" disabled={isSaving}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Creating Trip..." : "Create Trip"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
