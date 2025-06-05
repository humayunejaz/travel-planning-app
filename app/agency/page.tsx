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

interface Trip {
  id: string
  title: string
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

export default function AgencyDashboardPage() {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const userRole = localStorage.getItem("userRole")

    if (!isAuthenticated || userRole !== "agency") {
      router.push("/agency/login")
      return
    }

    // Load user data
    const userName = localStorage.getItem("userName") || "Agency User"
    const userEmail = localStorage.getItem("userEmail") || ""
    setUser({ name: userName, email: userEmail, role: userRole })

    // Load all trips from localStorage
    const allTrips = JSON.parse(localStorage.getItem("trips") || "[]")

    // Enhance trips with user information
    const enhancedTrips = allTrips.map((trip: any) => {
      // In a real app, you'd fetch this from your database
      // For now, we'll use mock data or stored data
      const userId = trip.userId || "user-" + Math.floor(Math.random() * 1000)
      const userName = trip.userName || "Traveler " + userId.split("-")[1]
      const userEmail = trip.userEmail || `traveler${userId.split("-")[1]}@example.com`

      return {
        ...trip,
        userId,
        userName,
        userEmail,
      }
    })

    setTrips(enhancedTrips)
    setFilteredTrips(enhancedTrips)
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
          trip.userName.toLowerCase().includes(query) ||
          trip.userEmail.toLowerCase().includes(query),
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
          filtered = filtered.filter((trip) => new Date(trip.startDate) > today)
          break
        case "month":
          filtered = filtered.filter((trip) => new Date(trip.startDate) > today && new Date(trip.startDate) <= oneMonth)
          break
        case "quarter":
          filtered = filtered.filter(
            (trip) => new Date(trip.startDate) > today && new Date(trip.startDate) <= threeMonths,
          )
          break
      }
    }

    setFilteredTrips(filtered)
  }

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userName")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userRole")
    router.push("/agency/login")
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
    return trips.filter((trip) => new Date(trip.startDate) > today).length
  }

  const getUniqueDestinationsCount = () => {
    const allCountries = trips.flatMap((trip) => trip.countries)
    return new Set(allCountries).size
  }

  const getUniqueUsersCount = () => {
    const userIds = trips.map((trip) => trip.userId)
    return new Set(userIds).size
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
              {/* Trip List */}
              <div className="space-y-6">
                {filteredTrips.length > 0 ? (
                  filteredTrips.map((trip) => <TripCard key={trip.id} trip={trip} />)
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
                    <p className="text-gray-600">Try adjusting your filters or search query</p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="planning" className="mt-6">
              <div className="space-y-6">
                {filteredTrips.filter((trip) => trip.status === "planning").length > 0 ? (
                  filteredTrips
                    .filter((trip) => trip.status === "planning")
                    .map((trip) => <TripCard key={trip.id} trip={trip} />)
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No planning trips found</h3>
                    <p className="text-gray-600">Try adjusting your filters or search query</p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="confirmed" className="mt-6">
              <div className="space-y-6">
                {filteredTrips.filter((trip) => trip.status === "confirmed").length > 0 ? (
                  filteredTrips
                    .filter((trip) => trip.status === "confirmed")
                    .map((trip) => <TripCard key={trip.id} trip={trip} />)
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No confirmed trips found</h3>
                    <p className="text-gray-600">Try adjusting your filters or search query</p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="completed" className="mt-6">
              <div className="space-y-6">
                {filteredTrips.filter((trip) => trip.status === "completed").length > 0 ? (
                  filteredTrips
                    .filter((trip) => trip.status === "completed")
                    .map((trip) => <TripCard key={trip.id} trip={trip} />)
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No completed trips found</h3>
                    <p className="text-gray-600">Try adjusting your filters or search query</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

interface TripCardProps {
  trip: Trip
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

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 border-b p-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{trip.title}</CardTitle>
            <div className="text-sm text-gray-500">
              {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
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
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Traveler</p>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">
                  {trip.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{trip.userName}</p>
                  <p className="text-xs text-gray-500">{trip.userEmail}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Collaborators</p>
              <p className="text-sm">{trip.collaborators.length} people</p>
            </div>
          </div>

          <div className="flex flex-col justify-center items-end space-y-2">
            <Link href={`/agency/trips/${trip.id}`}>
              <Button variant="default">View Details</Button>
            </Link>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
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
