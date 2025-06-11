"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Plane,
  MapPin,
  Calendar,
  Users,
  Mail,
  Phone,
  Clock,
  UserIcon,
  MessageSquare,
  Send,
} from "lucide-react"
import { authService, type User } from "@/lib/auth"
import { tripsService, type TripWithCollaborators } from "@/lib/trips"

export default function TripDetailsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [trip, setTrip] = useState<TripWithCollaborators | null>(null)
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const params = useParams()
  const tripId = params.id as string

  useEffect(() => {
    const loadTripDetails = async () => {
      try {
        // Check authentication
        const currentUser = await authService.getCurrentUser()
        if (!currentUser) {
          router.push("/agency/login")
          return
        }

        if (currentUser.role !== "agency") {
          router.push("/")
          return
        }

        setUser(currentUser)

        // Load trip data
        const tripData = await tripsService.getTripById(tripId)
        if (!tripData) {
          setError("Trip not found")
          return
        }

        setTrip(tripData)

        // Load agency notes if any (for now, we'll use localStorage)
        const savedNotes = localStorage.getItem(`agency-notes-${tripId}`)
        if (savedNotes) {
          setNotes(savedNotes)
        }
      } catch (error) {
        console.error("Error loading trip details:", error)
        setError("Failed to load trip details")
      } finally {
        setIsLoading(false)
      }
    }

    loadTripDetails()
  }, [router, tripId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const calculateTripDuration = () => {
    if (!trip || !trip.start_date || !trip.end_date) return "N/A"
    const start = new Date(trip.start_date)
    const end = new Date(trip.end_date)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `${diffDays} days`
  }

  const saveNotes = async () => {
    setIsSavingNotes(true)
    try {
      // For now, save to localStorage. In a real app, you'd save to database
      localStorage.setItem(`agency-notes-${tripId}`, notes)
      alert("Notes saved successfully!")
    } catch (error) {
      console.error("Error saving notes:", error)
      alert("Failed to save notes")
    } finally {
      setIsSavingNotes(false)
    }
  }

  const handleContactTraveler = () => {
    if (trip?.user_email) {
      window.location.href = `mailto:${trip.user_email}?subject=Regarding your trip: ${trip.title}`
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading trip details...</p>
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Trip not found"}</p>
          <Link href="/agency">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/agency">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center ml-4">
              <Plane className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">Trip Details</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trip Details Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Header */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{trip.title}</CardTitle>
                    <CardDescription className="text-base mt-1">
                      {trip.start_date && trip.end_date ? (
                        <>
                          {new Date(trip.start_date).toLocaleDateString()} -{" "}
                          {new Date(trip.end_date).toLocaleDateString()}
                        </>
                      ) : (
                        "Dates not set"
                      )}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(trip.status)}>{trip.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium">{calculateTripDuration()}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Countries</p>
                      <p className="font-medium">{trip.countries?.length || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Collaborators</p>
                      <p className="font-medium">{trip.collaborators?.length || 0}</p>
                    </div>
                  </div>
                </div>

                {trip.description && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600 mb-1">Description</p>
                    <p className="text-gray-700">{trip.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Destinations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Destinations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Countries</p>
                    <div className="flex flex-wrap gap-2">
                      {trip.countries && trip.countries.length > 0 ? (
                        trip.countries.map((country) => (
                          <Badge key={country} variant="secondary">
                            {country}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500">No countries added</span>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Cities</p>
                    <div className="flex flex-wrap gap-2">
                      {trip.cities && trip.cities.length > 0 ? (
                        trip.cities.map((city) => (
                          <Badge key={city} variant="outline">
                            {city}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500">No cities added</span>
                      )}
                    </div>
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
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trip.collaborators && trip.collaborators.length > 0 ? (
                    trip.collaborators.map((email) => (
                      <div key={email} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                            {email.charAt(0).toUpperCase()}
                          </div>
                          <span>{email}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No collaborators for this trip</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Traveler Info and Agency Actions Column */}
          <div className="space-y-6">
            {/* Traveler Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Traveler Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                    {trip.user_name ? trip.user_name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <p className="font-medium">{trip.user_name || "Unknown User"}</p>
                    <p className="text-sm text-gray-500">{trip.user_email || "No email"}</p>
                  </div>
                </div>
                <div className="space-y-3 mt-4">
                  <Button className="w-full" onClick={handleContactTraveler}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Traveler
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Agency Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Agency Notes
                </CardTitle>
                <CardDescription>Private notes about this trip</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add your notes about this trip..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={6}
                      disabled={isSavingNotes}
                    />
                  </div>
                  <Button onClick={saveNotes} className="w-full" disabled={isSavingNotes}>
                    <Send className="h-4 w-4 mr-2" />
                    {isSavingNotes ? "Saving..." : "Save Notes"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Follow-up
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Plane className="h-4 w-4 mr-2" />
                  Suggest Itinerary
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Assign Agent
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
