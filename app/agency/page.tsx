"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LogOut, Users, MapPin, Calendar, Plane, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { authService } from "@/lib/auth"
import { tripsService, type Trip } from "@/lib/trips"
import { isSupabaseAvailable } from "@/lib/supabase"

export default function AgencyDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  const loadDashboard = async () => {
    try {
      console.log("Loading agency dashboard...")
      setIsLoading(true)
      setError(null)

      // Get current user
      const currentUser = await authService.getCurrentUser()

      if (!currentUser) {
        console.log("No user found, redirecting to agency login")
        router.push("/agency/login")
        return
      }

      console.log("Current user role:", currentUser.role)

      if (currentUser.role !== "agency") {
        console.log("Not an agency user, redirecting to traveler dashboard")
        router.push("/dashboard")
        return
      }

      setUser(currentUser)
      console.log("Agency user loaded:", currentUser)

      // Load ALL trips from database (agency can see all trips)
      if (isSupabaseAvailable()) {
        const allTrips = await tripsService.getAllTrips()
        setTrips(allTrips)
        console.log(`Loaded ${allTrips.length} trips for agency view`)
      } else {
        // Fallback to localStorage for demo mode
        const localTrips = JSON.parse(localStorage.getItem("trips") || "[]")
        setTrips(localTrips)
        console.log(`Loaded ${localTrips.length} trips from localStorage`)
      }
    } catch (error) {
      console.error("Dashboard error:", error)
      setError("Error loading dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [router])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboard()
    setRefreshing(false)
  }

  const handleLogout = async () => {
    try {
      await authService.signOut()
      router.push("/agency/login")
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/agency/login")
    }
  }

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading agency dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Filter trips by status
  const planningTrips = trips.filter((trip) => trip.status === "planning")
  const confirmedTrips = trips.filter((trip) => trip.status === "confirmed")
  const completedTrips = trips.filter((trip) => trip.status === "completed")

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
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
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
        {/* Database Mode Indicator */}
        {isSupabaseAvailable() ? (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Database Mode Active</strong> - Viewing all client trips from Supabase database.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Demo Mode Active</strong> - Using local storage for trip data.
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Agency Dashboard</h2>
          <p className="text-gray-600">Manage all client trips and travel arrangements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <Calendar className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Planning</p>
                  <p className="text-2xl font-bold text-gray-900">{planningTrips.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold text-gray-900">{confirmedTrips.length}</p>
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
            <TabsTrigger value="all">All Trips ({trips.length})</TabsTrigger>
            <TabsTrigger value="planning">Planning ({planningTrips.length})</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed ({confirmedTrips.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedTrips.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <h3 className="text-lg font-medium mb-4">All Client Trips</h3>
            {renderTripsList(trips)}
          </TabsContent>
          <TabsContent value="planning" className="mt-6">
            <h3 className="text-lg font-medium mb-4">Planning Stage</h3>
            {renderTripsList(planningTrips)}
          </TabsContent>
          <TabsContent value="confirmed" className="mt-6">
            <h3 className="text-lg font-medium mb-4">Confirmed Trips</h3>
            {renderTripsList(confirmedTrips)}
          </TabsContent>
          <TabsContent value="completed" className="mt-6">
            <h3 className="text-lg font-medium mb-4">Completed Trips</h3>
            {renderTripsList(completedTrips)}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )

  function renderTripsList(tripsToRender: Trip[]) {
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
                    Client ID: {trip.user_id.substring(0, 8)}...
                    {trip.start_date && trip.end_date
                      ? ` • ${new Date(trip.start_date).toLocaleDateString()} - ${new Date(
                          trip.end_date,
                        ).toLocaleDateString()}`
                      : " • Dates not set"}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(trip.status)}>{trip.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Description</p>
                  <p className="text-sm text-gray-800 line-clamp-2">{trip.description || "No description"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Countries</p>
                  <div className="flex flex-wrap gap-1">
                    {trip.countries && trip.countries.length > 0 ? (
                      trip.countries.map((country: string) => (
                        <Badge key={country} variant="secondary" className="text-xs">
                          {country}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">No countries</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Cities</p>
                  <div className="flex flex-wrap gap-1">
                    {trip.cities && trip.cities.length > 0 ? (
                      trip.cities.map((city: string) => (
                        <Badge key={city} variant="outline" className="text-xs">
                          {city}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">No cities</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/agency/trips/${trip.id}`)}>
                    Manage Trip
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
