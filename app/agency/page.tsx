"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plane, LogOut, Search, MapPin, Calendar, Users, Filter, Mail, Phone } from "lucide-react"
import { authService, type User } from "@/lib/auth"
import { tripsService, type TripWithCollaborators } from "@/lib/trips"

export default function AgencyDashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [trips, setTrips] = useState<TripWithCollaborators[]>([])
  const [filteredTrips, setFilteredTrips] = useState<TripWithCollaborators[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const router = useRouter()

  useEffect(() => {
    const loadAgencyData = async () => {
      try {
        // Check authentication
        const currentUser = await authService.getCurrentUser()
        if (!currentUser) {
          router.push("/agency/login")
          return
        }

        // Make sure it's an agency user
        if (currentUser.role !== "agency") {
          router.push("/")
          return
        }

        setUser(currentUser)

        // Load all trips for agency view
        const allTrips = await tripsService.getAllTrips()
        setTrips(allTrips)
        setFilteredTrips(allTrips)
      } catch (error) {
        console.error("Error loading agency dashboard:", error)
        setError("Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }

    loadAgencyData()
  }, [router])

  useEffect(() => {
    // Apply filters whenever search query or filters change
    applyFilters()
  }, [searchQuery, statusFilter, dateFilter, trips])

  const applyFilters = () => {
    let filtered = [...trips]

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (trip) =>
          trip.title.toLowerCase().includes(query) ||
          trip.countries.some((country) => country.toLowerCase().includes(query)) ||
          trip.cities.some((city) => city.toLowerCase().includes(query)) ||
          (trip.user_name && trip.user_name.toLowerCase().includes(query)) ||
          (trip.user_email && trip.user_email.toLowerCase().includes(query)),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((trip) => trip.status === statusFilter)
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const today = new Date()
      const oneMonth = new Date()
      oneMonth.setMonth(today.getMonth() + 1)
      const threeMonths = new Date()
      threeMonths.setMonth(today.getMonth() + 3)

      switch (dateFilter) {
        case "upcoming":
          filtered = filtered.filter((trip) => trip.start_date && new Date(trip.start_date) > today)
          break
        case "month":
          filtered = filtered.filter(
            (trip) => trip.start_date && new Date(trip.start_date) > today && new Date(trip.start_date) <= oneMonth,
          )
          break
        case "quarter":
          filtered = filtered.filter(
            (trip) => trip.start_date && new Date(trip.start_date) > today && new Date(trip.start_date) <= threeMonths,
          )
          break
      }
    }

    setFilteredTrips(filtered)
  }

  const handleLogout = async () => {
    try {
      await authService.signOut()
      router.push("/agency/login")
    } catch (error) {
      console.error("Logout error:", error)
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

  const getTripCountByStatus = (status: string) => {
    if (status === "all") return trips.length
    return trips.filter((trip) => trip.status === status).length
  }

  const getUpcomingTripsCount = () => {
    const today = new Date()
    return trips.filter((trip) => trip.start_date && new Date(trip.start_date) > today).length
  }

  const getUniqueDestinationsCount = () => {
    const allCountries = trips.flatMap((trip) => trip.countries || [])
    return new Set(allCountries).size
  }

  const getUniqueUsersCount = () => {
    const userIds = trips.map((trip) => trip.user_id)
    return new Set(userIds).size
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
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
              <h1 className="text-2xl font-bold text-gray-900">
                TravelPlan <span className="text-blue-600">Agency</span>
              </h1>
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
              <h2 className="text-3xl font-bold text-gray-900">Agency Dashboard</h2>
              <p className="text-gray-600 mt-1">Monitor and manage customer travel plans</p>
            </div>
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
                  <Calendar className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Upcoming</p>
                    <p className="text-2xl font-bold text-gray-900">{getUpcomingTripsCount()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <MapPin className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Destinations</p>
                    <p className="text-2xl font-bold text-gray-900">{getUniqueDestinationsCount()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Travelers</p>
                    <p className="text-2xl font-bold text-gray-900">{getUniqueUsersCount()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Search trips, destinations, or travelers..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-40">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-40">
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="upcoming">All Upcoming</SelectItem>
                      <SelectItem value="month">Next Month</SelectItem>
                      <SelectItem value="quarter">Next 3 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Trips ({getTripCountByStatus("all")})</TabsTrigger>
              <TabsTrigger value="planning">Planning ({getTripCountByStatus("planning")})</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed ({getTripCountByStatus("confirmed")})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({getTripCountByStatus("completed")})</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              <TripsList trips={filteredTrips} />
            </TabsContent>
            <TabsContent value="planning" className="mt-6">
              <TripsList trips={filteredTrips.filter((trip) => trip.status === "planning")} />
            </TabsContent>
            <TabsContent value="confirmed" className="mt-6">
              <TripsList trips={filteredTrips.filter((trip) => trip.status === "confirmed")} />
            </TabsContent>
            <TabsContent value="completed" className="mt-6">
              <TripsList trips={filteredTrips.filter((trip) => trip.status === "completed")} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

interface TripsListProps {
  trips: TripWithCollaborators[]
}

function TripsList({ trips }: TripsListProps) {
  if (trips.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
        <p className="text-gray-600">Try adjusting your filters or search query</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  )
}

interface TripCardProps {
  trip: TripWithCollaborators
}

function TripCard({ trip }: TripCardProps) {
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

  const handleContactTraveler = () => {
    if (trip.user_email) {
      window.location.href = `mailto:${trip.user_email}?subject=Regarding your trip: ${trip.title}`
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 border-b p-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{trip.title}</CardTitle>
            <div className="text-sm text-gray-500">
              {trip.start_date && trip.end_date ? (
                <>
                  {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                </>
              ) : (
                "Dates not set"
              )}
            </div>
          </div>
          <Badge className={getStatusColor(trip.status)}>{trip.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Traveler</p>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">
                  {trip.user_name ? trip.user_name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <p className="text-sm font-medium">{trip.user_name || "Unknown User"}</p>
                  <p className="text-xs text-gray-500">{trip.user_email || "No email"}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Collaborators</p>
              <p className="text-sm">{trip.collaborators?.length || 0} people</p>
            </div>
          </div>

          <div className="flex flex-col justify-center items-end space-y-2">
            <Link href={`/agency/trips/${trip.id}`}>
              <Button variant="default">View Details</Button>
            </Link>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleContactTraveler}>
                <Mail className="h-4 w-4 mr-1" />
                Contact
              </Button>
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-1" />
                Call
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
