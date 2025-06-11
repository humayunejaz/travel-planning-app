"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, Calendar, MapPin, Users, XCircle } from "lucide-react"
import { tripsService } from "@/lib/trips"
import { authService } from "@/lib/auth"

export default function TripDetailsPage({ params }) {
  const [trip, setTrip] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function loadTripDetails() {
      try {
        setIsLoading(true)
        setError(null)

        // Check authentication
        const currentUser = await authService.getCurrentUser()
        if (!currentUser || currentUser.role !== "agency") {
          router.push("/agency/login")
          return
        }

        // Load trip details
        const tripData = await tripsService.getTripById(params.id)
        if (!tripData) {
          setError("Trip not found")
          return
        }

        setTrip(tripData)
      } catch (err) {
        console.error("Error loading trip details:", err)
        setError("Failed to load trip details")
      } finally {
        setIsLoading(false)
      }
    }

    loadTripDetails()
  }, [params.id, router])

  const handleStatusChange = async (newStatus) => {
    try {
      await tripsService.updateTrip(trip.id, { status: newStatus })
      setTrip({ ...trip, status: newStatus })
    } catch (err) {
      console.error("Error updating trip status:", err)
    }
  }

  const getStatusColor = (status) => {
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

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <Button variant="ghost" onClick={() => router.push("/agency")} className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!trip) return null

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Button variant="ghost" onClick={() => router.push("/agency")} className="mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{trip.title}</h1>
            <p className="text-gray-600 mt-1">
              {trip.start_date && trip.end_date
                ? `${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}`
                : "Dates not set"}
            </p>
          </div>
          <Badge className={getStatusColor(trip.status)}>{trip.status}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium">
                  {trip.start_date && trip.end_date
                    ? `${Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / (1000 * 60 * 60 * 24))} days`
                    : "Not set"}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Destinations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium">
                  {trip.countries && trip.countries.length > 0
                    ? `${trip.countries.length} ${trip.countries.length === 1 ? "country" : "countries"}`
                    : "No countries added"}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Travelers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium">
                  {trip.collaborators && trip.collaborators.length > 0
                    ? `${trip.collaborators.length + 1} travelers`
                    : "1 traveler"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
            <CardDescription>Complete information about this trip</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Description</h3>
                <p className="text-gray-800">{trip.description || "No description provided."}</p>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Countries</h3>
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
                <h3 className="text-sm font-medium text-gray-600 mb-2">Cities</h3>
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

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Collaborators</h3>
                <div className="flex flex-wrap gap-2">
                  {trip.collaborators && trip.collaborators.length > 0 ? (
                    trip.collaborators.map((email) => (
                      <Badge key={email} variant="outline">
                        {email}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500">No collaborators</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agency Actions</CardTitle>
            <CardDescription>Update trip status and manage client trip</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Update Trip Status</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={trip.status === "planning" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange("planning")}
                  >
                    Planning
                  </Button>
                  <Button
                    variant={trip.status === "confirmed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange("confirmed")}
                  >
                    Confirmed
                  </Button>
                  <Button
                    variant={trip.status === "completed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange("completed")}
                  >
                    Completed
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
