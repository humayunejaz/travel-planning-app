"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Plane,
  LogOut,
  Plus,
  Loader2,
  AlertCircle,
  Calendar,
  MapPin,
  Users,
  Edit,
  Eye,
  User,
  Crown,
} from "lucide-react"
import { format } from "date-fns"
import { authService } from "@/lib/auth"
import { tripsService, type Trip } from "@/lib/trips"
import { isSupabaseAvailable } from "@/lib/supabase"

interface UserType {
  id: string
  name: string
  email: string
  role: string
}

interface TripWithRole extends Trip {
  isOwner: boolean
  isCollaborator: boolean
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [trips, setTrips] = useState<TripWithRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadUserAndTrips = async () => {
      try {
        console.log("Loading user and trips...")

        // Get current user
        const currentUser = await authService.getCurrentUser()

        if (!currentUser) {
          console.log("No user found, redirecting to login")
          router.push("/login")
          return
        }

        if (currentUser.role === "agency") {
          console.log("Agency user, redirecting to agency dashboard")
          router.push("/agency")
          return
        }

        setUser(currentUser)
        console.log("User loaded:", currentUser)

        // Load trips (both owned and collaborated)
        const userTrips = await tripsService.getUserTrips(currentUser.id, currentUser.email)

        // Add role information to each trip
        const tripsWithRole: TripWithRole[] = userTrips.map((trip) => ({
          ...trip,
          isOwner: trip.user_id === currentUser.id,
          isCollaborator: trip.user_id !== currentUser.id,
        }))

        setTrips(tripsWithRole)
        console.log(`Loaded ${tripsWithRole.length} trips (owned + collaborated)`)
      } catch (err) {
        console.error("Error loading user and trips:", err)
        setError("Error loading data")
      } finally {
        setLoading(false)
      }
    }

    loadUserAndTrips()
  }, [router])

  const handleSignOut = async () => {
    try {
      console.log("Signing out...")
      await authService.signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleNewTrip = () => {
    console.log("🚀 Navigating to new trip page...")
    router.push("/trips/new")
  }

  const handleViewProfile = () => {
    console.log("👤 Navigating to profile page...")
    router.push("/profile")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
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

  // Group trips by ownership and status
  const ownedTrips = trips.filter((trip) => trip.isOwner)
  const collaboratedTrips = trips.filter((trip) => trip.isCollaborator)

  const upcomingTrips = trips.filter((trip) => {
    const today = new Date()
    const endDate = new Date(trip.end_date || trip.created_at)
    return endDate >= today
  })

  const pastTrips = trips.filter((trip) => {
    const today = new Date()
    const endDate = new Date(trip.end_date || trip.created_at)
    return endDate < today
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Plane className="h-6 w-6 text-blue-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-900">TravelPlan</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user?.name || user?.email?.split("@")[0] || "User"}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Database Mode Indicator */}
        {isSupabaseAvailable() ? (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Database Mode Active</strong> - Using Supabase for data storage.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Demo Mode Active</strong> - Using local storage for data.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Trips</h2>
            <p className="text-gray-600 mt-1">
              {ownedTrips.length} owned • {collaboratedTrips.length} collaborated
            </p>
          </div>
          <Button onClick={handleNewTrip}>
            <Plus className="h-4 w-4 mr-2" />
            New Trip
          </Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Trips ({trips.length})</TabsTrigger>
            <TabsTrigger value="owned">My Trips ({ownedTrips.length})</TabsTrigger>
            <TabsTrigger value="collaborated">Collaborated ({collaboratedTrips.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcomingTrips.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastTrips.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {trips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No trips found</CardTitle>
                  <CardDescription>You haven't created any trips yet, and haven't been invited to any.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleNewTrip}>Plan your first trip</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="owned" className="space-y-4">
            {ownedTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ownedTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No trips created</CardTitle>
                  <CardDescription>You haven't created any trips yet.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleNewTrip}>Create your first trip</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="collaborated" className="space-y-4">
            {collaboratedTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collaboratedTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No collaborated trips</CardTitle>
                  <CardDescription>You haven't been invited to collaborate on any trips yet.</CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No upcoming trips</CardTitle>
                  <CardDescription>You don't have any upcoming trips planned.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleNewTrip}>Plan a new trip</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No past trips</CardTitle>
                  <CardDescription>You haven't completed any trips yet.</CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <Separator className="my-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={handleNewTrip}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Trip
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={handleViewProfile}>
                <User className="h-4 w-4 mr-2" />
                View Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function TripCard({ trip }: { trip: TripWithRole }) {
  const router = useRouter()

  // Format dates safely
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set"
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch {
      return "Invalid date"
    }
  }

  const formattedStartDate = formatDate(trip.start_date)
  const formattedEndDate = formatDate(trip.end_date)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-blue-50 pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{trip.title}</CardTitle>
          {trip.isOwner ? (
            <Badge variant="default" className="ml-2">
              <Crown className="h-3 w-3 mr-1" />
              Owner
            </Badge>
          ) : (
            <Badge variant="secondary" className="ml-2">
              <Users className="h-3 w-3 mr-1" />
              Collaborator
            </Badge>
          )}
        </div>
        <CardDescription>
          <div className="flex items-center mt-1">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              {formattedStartDate} - {formattedEndDate}
            </span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {trip.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{trip.description}</p>}

        {trip.countries && trip.countries.length > 0 && (
          <div className="flex items-start mb-2">
            <MapPin className="h-4 w-4 mr-1 mt-0.5 text-gray-500" />
            <div className="text-sm">{trip.countries.join(", ")}</div>
          </div>
        )}

        {trip.cities && trip.cities.length > 0 && (
          <div className="flex items-start">
            <Users className="h-4 w-4 mr-1 mt-0.5 text-gray-500" />
            <div className="text-sm">{trip.cities.join(", ")}</div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 border-t p-3">
        <div className="flex gap-2 w-full">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/trips/${trip.id}`)}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button variant="default" size="sm" className="flex-1" onClick={() => router.push(`/trips/${trip.id}/edit`)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
