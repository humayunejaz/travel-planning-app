"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
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
  const [success, setSuccess] = useState("")
  const isSubmittingRef = useRef(false) // Prevent double submission

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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication...")
        const currentUser = await authService.getCurrentUser()

        if (!currentUser) {
          console.log("No user found, redirecting to login")
          router.push("/")
          return
        }

        if (currentUser.role === "agency") {
          console.log("Agency user, redirecting to agency dashboard")
          router.push("/agency")
          return
        }

        setIsAuthenticated(true)
        setUser(currentUser)
        console.log("Authentication successful:", currentUser.email)
      } catch (error) {
        console.error("Auth check error:", error)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent double submission
    if (isSubmittingRef.current || isSaving) {
      console.log("⚠️ Form already being submitted, ignoring...")
      return
    }

    isSubmittingRef.current = true
    console.log("=== FORM SUBMITTED ===")

    setError("")
    setSuccess("")
    setIsSaving(true)

    try {
      // Basic validation
      if (!tripData.title.trim()) {
        throw new Error("Trip title is required")
      }

      if (!tripData.startDate) {
        throw new Error("Start date is required")
      }

      if (!tripData.endDate) {
        throw new Error("End date is required")
      }

      if (!user) {
        throw new Error("User not authenticated")
      }

      console.log("Creating trip with data:", {
        title: tripData.title,
        description: tripData.description,
        start_date: tripData.startDate,
        end_date: tripData.endDate,
        countries: tripData.countries,
        cities: tripData.cities,
      })

      // Create the trip
      const createdTrip = await tripsService.createTrip(
        {
          title: tripData.title,
          description: tripData.description,
          start_date: tripData.startDate,
          end_date: tripData.endDate,
          countries: tripData.countries,
          cities: tripData.cities,
        },
        tripData.collaborators,
        user.id,
      )

      console.log("Trip created successfully:", createdTrip)

      // Show success message
      setSuccess("Trip created successfully!")

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (error: any) {
      console.error("Error creating trip:", error)
      setError(error.message || "Failed to create trip")
    } finally {
      setIsSaving(false)
      isSubmittingRef.current = false // Reset the flag
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
        {/* Error Message */}
        {error && <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>
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
            <Button type="submit" disabled={isSaving || isSubmittingRef.current} className="min-w-[120px]">
              {isSaving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                "Create Trip"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}

