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
import { ArrowLeft, Plane, MapPin, Calendar, Users, Mail, Phone, Clock, User, MessageSquare, Send } from "lucide-react"

interface Trip {
  id: string
  title: string
  description?: string
  countries: string[]
  cities: string[]
  startDate: string
  endDate: string
  collaborators: string[]
  status: "planning" | "confirmed" | "completed"
  userId: string
  userName: string
  userEmail: string
}

export default function TripDetailsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [notes, setNotes] = useState("")
  const router = useRouter()
  const params = useParams()
  const tripId = params.id as string

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated")
    const userRole = localStorage.getItem("userRole")

    if (!authStatus || userRole !== "agency") {
      router.push("/agency/login")
      return
    }
    setIsAuthenticated(true)

    // Load trip data
    const trips = JSON.parse(localStorage.getItem("trips") || "[]")
    const foundTrip = trips.find((t: any) => t.id === tripId)

    if (foundTrip) {
      // Add user information if not present
      const enhancedTrip = {
        ...foundTrip,
        userId: foundTrip.userId || "user-" + Math.floor(Math.random() * 1000),
        userName:
          foundTrip.userName || "Traveler " + (foundTrip.userId?.split("-")[1] || Math.floor(Math.random() * 1000)),
        userEmail:
          foundTrip.userEmail ||
          `traveler${foundTrip.userId?.split("-")[1] || Math.floor(Math.random() * 1000)}@example.com`,
      }

      setTrip(enhancedTrip)

      // Load agency notes if any
      const savedNotes = localStorage.getItem(`agency-notes-${tripId}`)
      if (savedNotes) {
        setNotes(savedNotes)
      }
    } else {
      router.push("/agency")
    }
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
    if (!trip) return "N/A"
    const start = new Date(trip.startDate)
    const end = new Date(trip.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `${diffDays} days`
  }

  const saveNotes = () => {
    localStorage.setItem(`agency-notes-${tripId}`, notes)
    alert("Notes saved successfully!")
  }

  const handleContactTraveler = () => {
    alert(`Contact email sent to ${trip?.userEmail}`)
  }

  if (!isAuthenticated || !trip) {
    return <div>Loading...</div>
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
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
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
                      <p className="font-medium">{trip.countries.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Collaborators</p>
                      <p className="font-medium">{trip.collaborators.length}</p>
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
                      {trip.countries.map((country) => (
                        <Badge key={country} variant="secondary">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Cities</p>
                    <div className="flex flex-wrap gap-2">
                      {trip.cities.map((city) => (
                        <Badge key={city} variant="outline">
                          {city}
                        </Badge>
                      ))}
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
                  {trip.collaborators.length > 0 ? (
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
                  <User className="h-5 w-5 mr-2" />
                  Traveler Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                    {trip.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{trip.userName}</p>
                    <p className="text-sm text-gray-500">{trip.userEmail}</p>
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
                    />
                  </div>
                  <Button onClick={saveNotes} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Save Notes
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
