"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Users, MapPin, Calendar, Plane } from "lucide-react"
import { authService } from "@/lib/auth"
import { tripsService } from "@/lib/trips"

export default function AgencyDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [trips, setTrips] = useState([])
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState("all")
  const router = useRouter()

  useEffect(() => {
    async function loadDashboard() {
      try {
        console.log("Loading agency dashboard...")
        setIsLoading(true)

        // Check authentication
        const currentUser = await authService.getCurrentUser()
        console.log("Current user:", currentUser)

        if (!currentUser) {
          console.log("No user found, redirecting to login")
          router.push("/agency/login")
          return
        }

        if (currentUser.role !== "agency") {
          console.log("Not an agency user, redirecting to traveler dashboard")
          router.push("/dashboard")
          return
        }

        setUser(currentUser)

        // Load all trips (simplified for demo)
        try {
          const allTrips = await tripsService.getUserTrips(currentUser.id)
          console.log("Loaded trips:", allTrips)
          setTrips(allTrips)
        } catch (error) {
          console.error("Error loading trips:", error)
          setTrips([])
        }
      } catch (error) {
        console.error("Dashboard error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [router])

  const handleLogout = async () => {
    try {
      await authService.signOut()
      router.push("/agency/login")
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/agency/login")
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
          <p className="mt-2 text-gray-600">Loading agency dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Plane className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">TravelPlan Agency</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Agency: {user?.name || "Travel Agency"}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Agency Dashboard</h2>
          <p className="text-gray-600">Manage client trips and travel arrangements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Trips</p>
                  <p className="text-2xl font-bold text-gray-900">{trips.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {trips.filter((trip) => trip.status === "confirmed").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Clients</p>
                  <p className="text-2xl font-bold text-gray-900">{new Set(trips.map((trip) => trip.user_id)).size}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="mb-8" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Trips</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <h3 className="text-lg font-medium mb-4">All Client Trips</h3>
            {renderTripsList(trips)}
          </TabsContent>
          <TabsContent value="planning" className="mt-6">
            <h3 className="text-lg font-medium mb-4">Planning Stage</h3>
            {renderTripsList(trips.filter((trip) => trip.status === "planning"))}
          </TabsContent>
          <TabsContent value="confirmed" className="mt-6">
            <h3 className="text-lg font-medium mb-4">Confirmed Trips</h3>
            {renderTripsList(trips.filter((trip) => trip.status === "confirmed"))}
          </TabsContent>
          <TabsContent value="completed" className="mt-6">
            <h3 className="text-lg font-medium mb-4">Completed Trips</h3>
            {renderTripsList(trips.filter((trip) => trip.status === "completed"))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )

  function renderTripsList(tripsToRender) {
    if (tripsToRender.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-lg border">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
          <p className="text-gray-600">
            {activeTab === "all" ? "No client trips have been created yet." : `No trips in ${activeTab} status.`}
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {tripsToRender.map((trip) => (
          <Card key={trip.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{trip.title}</CardTitle>
                  <CardDescription>
                    {trip.start_date && trip.end_date
                      ? `${new Date(trip.start_date).toLocaleDateString()} - ${new Date(
                          trip.end_date,
                        ).toLocaleDateString()}`
                      : "Dates not set"}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(trip.status)}>{trip.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Countries</p>
                  <div className="flex flex-wrap gap-1">
                    {trip.countries && trip.countries.length > 0 ? (
                      trip.countries.map((country) => (
                        <Badge key={country} variant="secondary" className="text-xs">
                          {country}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">No countries added</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Cities</p>
                  <div className="flex flex-wrap gap-1">
                    {trip.cities && trip.cities.length > 0 ? (
                      trip.cities.map((city) => (
                        <Badge key={city} variant="outline" className="text-xs">
                          {city}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">No cities added</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/agency/trips/${trip.id}`)}>
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
}
