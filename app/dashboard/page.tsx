"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, MapPin, Calendar, Users, Edit, Plane, LogOut } from "lucide-react"
import { authService } from "@/lib/auth"
import { tripsService } from "@/lib/trips"
import { EmailDashboard } from "@/components/email-dashboard"
import { DebugPanel } from "@/components/debug-panel"
import { ResendSetupBanner } from "@/components/resend-setup-banner"
import { EmailTestPanel } from "@/components/email-test-panel"

interface Trip {
  id: string
  title: string
  countries: string[]
  cities: string[]
  start_date: string
  end_date: string
  collaborators: string[]
  status: "planning" | "confirmed" | "completed"
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        console.log("Loading dashboard data...")

        // Check authentication
        const currentUser = await authService.getCurrentUser()
        console.log("Current user:", currentUser)

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

        // Load trips
        console.log("Loading trips for user:", currentUser.id)
        const userTrips = await tripsService.getUserTrips(currentUser.id)
        console.log("Loaded trips:", userTrips)
        setTrips(userTrips)
      } catch (error) {
        console.error("Error loading dashboard:", error)
        // If there's an error, try to redirect to login
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [router])

  const handleLogout = async () => {
    try {
      await authService.signOut()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      // Force logout even if there's an error
      localStorage.removeItem("isAuthenticated")
      localStorage.removeItem("mockUser")
      router.push("/")
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
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
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Plane className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">TravelPlan</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
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
          {/* Resend Setup Banner */}
          <ResendSetupBanner />

          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Your Trips</h2>
              <p className="text-gray-600 mt-1">Plan, organize, and share your travel adventures</p>
            </div>
            <Link href="/trips/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Trip
              </Button>
            </Link>
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
                    <p className="text-sm font-medium text-gray-600">Collaborators</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Set(trips.flatMap((trip) => trip.collaborators)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trips Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Card key={trip.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{trip.title}</CardTitle>
                      <CardDescription>
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
                  <div className="space-y-3">
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
                          <>
                            {trip.cities.slice(0, 3).map((city) => (
                              <Badge key={city} variant="outline" className="text-xs">
                                {city}
                              </Badge>
                            ))}
                            {trip.cities.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{trip.cities.length - 3} more
                              </Badge>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-500">No cities added</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        {trip.collaborators?.length || 0} collaborators
                      </div>
                      <Link href={`/trips/${trip.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {trips.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No trips yet</h3>
              <p className="text-gray-600 mb-4">Start planning your first adventure!</p>
              <Link href="/trips/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Trip
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Debug Panel */}
        <DebugPanel />

        {/* Email Test Panel */}
        <EmailTestPanel />

        {/* Email Dashboard - floating button */}
        <EmailDashboard />
      </main>
    </div>
  )
}
