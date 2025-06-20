"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Calendar, MapPin, Users, Plane, Clock, DollarSign, FileText } from "lucide-react"
import { format } from "date-fns"
import { authService, type User } from "@/lib/auth"
import { tripsService, type SimpleTripWithCollaborators } from "@/lib/trips"
import { ItineraryBuilder } from "@/components/itinerary-builder"
import { BudgetTracker } from "@/components/budget-tracker"
import { DocumentStorage } from "@/components/document-storage"

export default function TripDetailPage() {
  const [user, setUser] = useState<User | null>(null)
  const [trip, setTrip] = useState<SimpleTripWithCollaborators | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const params = useParams()
  const tripId = params.id as string

  useEffect(() => {
    const loadTripData = async () => {
      try {
        console.log("🔍 Loading trip data for ID:", tripId)

        // Check authentication
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

        setUser(currentUser)

        // Load trip data
        console.log("📊 Loading trip from database/localStorage...")
        const tripData = await tripsService.getTripById(tripId, currentUser.email)

        if (!tripData) {
          console.error("❌ Trip not found")
          setError("Trip not found")
          return
        }

        console.log("✅ Trip loaded successfully:", tripData)
        setTrip(tripData)
      } catch (error) {
        console.error("❌ Error loading trip:", error)
        setError("Failed to load trip data")
      } finally {
        setIsLoading(false)
      }
    }

    loadTripData()
  }, [router, tripId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading trip...</p>
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Trip not found"}</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Format dates safely
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set"
    try {
      return format(new Date(dateString), "MMMM d, yyyy")
    } catch {
      return "Invalid date"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard">
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
            <Link href={`/trips/${trip.id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Trip
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trip Overview */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{trip.title}</CardTitle>
                <CardDescription className="mt-2 text-base">
                  {trip.description || "No description provided"}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(trip.status)}>
                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Dates */}
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Travel Dates</h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                  </p>
                </div>
              </div>

              {/* Destinations */}
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Destinations</h3>
                  <div className="text-sm text-gray-600">
                    {trip.countries && trip.countries.length > 0 && <p>Countries: {trip.countries.join(", ")}</p>}
                    {trip.cities && trip.cities.length > 0 && <p>Cities: {trip.cities.join(", ")}</p>}
                    {(!trip.countries || trip.countries.length === 0) && (!trip.cities || trip.cities.length === 0) && (
                      <p>No destinations specified</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Collaborators */}
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Collaborators</h3>
                  <div className="text-sm text-gray-600">
                    {trip.collaborators && trip.collaborators.length > 0 ? (
                      <div className="space-y-1">
                        {trip.collaborators.map((email) => (
                          <p key={email}>{email}</p>
                        ))}
                      </div>
                    ) : (
                      <p>No collaborators</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trip Planning Tabs */}
        <Tabs defaultValue="itinerary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="itinerary" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Itinerary
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Budget
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="itinerary">
            <ItineraryBuilder tripId={trip.id} />
          </TabsContent>

          <TabsContent value="budget">
            <BudgetTracker tripId={trip.id} />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentStorage tripId={trip.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
