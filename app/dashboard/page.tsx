"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, MapPin, Calendar, Users, Edit, Plane, LogOut } from "lucide-react"

interface Trip {
  id: string
  title: string
  countries: string[]
  cities: string[]
  startDate: string
  endDate: string
  collaborators: string[]
  status: "planning" | "confirmed" | "completed"
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    // Load user data
    const userName = localStorage.getItem("userName") || "User"
    const userEmail = localStorage.getItem("userEmail") || ""
    setUser({ name: userName, email: userEmail })

    // Load trips from localStorage (mock data)
    const savedTrips = localStorage.getItem("trips")
    if (savedTrips) {
      setTrips(JSON.parse(savedTrips))
    } else {
      // Mock initial trips
      const mockTrips: Trip[] = [
        {
          id: "1",
          title: "European Adventure",
          countries: ["France", "Italy", "Spain"],
          cities: ["Paris", "Rome", "Barcelona"],
          startDate: "2024-07-15",
          endDate: "2024-07-30",
          collaborators: ["john@example.com", "sarah@example.com"],
          status: "planning",
        },
        {
          id: "2",
          title: "Asian Discovery",
          countries: ["Japan", "Thailand"],
          cities: ["Tokyo", "Bangkok", "Kyoto"],
          startDate: "2024-09-10",
          endDate: "2024-09-25",
          collaborators: ["mike@example.com"],
          status: "confirmed",
        },
      ]
      setTrips(mockTrips)
      localStorage.setItem("trips", JSON.stringify(mockTrips))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userName")
    localStorage.removeItem("userEmail")
    router.push("/")
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

  if (!user) {
    return <div>Loading...</div>
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
                        {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
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
                        {trip.countries.map((country) => (
                          <Badge key={country} variant="secondary" className="text-xs">
                            {country}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Cities</p>
                      <div className="flex flex-wrap gap-1">
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
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        {trip.collaborators.length} collaborators
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
      </main>
    </div>
  )
}
