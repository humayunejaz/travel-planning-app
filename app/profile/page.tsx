"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Plane, ArrowLeft, Mail, Shield, Calendar, MapPin, Loader2, AlertCircle, Save, Edit } from "lucide-react"
import { format } from "date-fns"
import { authService, type User as AuthUser } from "@/lib/auth"
import { tripsService, type Trip } from "@/lib/trips"
import { isSupabaseAvailable } from "@/lib/supabase"
import { User } from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log("Loading user profile data...")

        // Get current user
        const currentUser = await authService.getCurrentUser()

        if (!currentUser) {
          console.log("No user found, redirecting to login")
          router.push("/login")
          return
        }

        setUser(currentUser)
        setEditName(currentUser.name)
        console.log("User profile loaded:", currentUser)

        // Load user's trips for stats
        const userTrips = await tripsService.getUserTrips(currentUser.id)
        setTrips(userTrips)
        console.log(`Loaded ${userTrips.length} trips for profile stats`)
      } catch (err) {
        console.error("Error loading profile data:", err)
        setError("Error loading profile data")
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  const handleSaveProfile = async () => {
    if (!user || !editName.trim()) return

    setSaving(true)
    try {
      // In demo mode, just update localStorage
      if (!isSupabaseAvailable()) {
        const updatedUser = { ...user, name: editName.trim() }
        localStorage.setItem("mockUser", JSON.stringify(updatedUser))
        setUser(updatedUser)
        setIsEditing(false)
        console.log("Profile updated in demo mode")
        return
      }

      // TODO: Add Supabase profile update logic here when needed
      console.log("Profile update not yet implemented for database mode")
      setError("Profile editing not yet available in database mode")
    } catch (err) {
      console.error("Error saving profile:", err)
      setError("Failed to save profile changes")
    } finally {
      setSaving(false)
    }
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading profile...</p>
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>User not found. Please log in again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Calculate trip stats
  const totalTrips = trips.length
  const upcomingTrips = trips.filter((trip) => {
    const endDate = new Date(trip.end_date || trip.created_at)
    return endDate >= new Date()
  }).length
  const completedTrips = totalTrips - upcomingTrips
  const countries = [...new Set(trips.flatMap((trip) => trip.countries || []))].length
  const cities = [...new Set(trips.flatMap((trip) => trip.cities || []))].length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={handleBackToDashboard} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <Plane className="h-6 w-6 text-blue-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
          </div>
          <div className="flex items-center space-x-4">
            {isSupabaseAvailable() ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Database Mode
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Demo Mode
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Profile Information
                  </CardTitle>
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-900">{user.name}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-gray-900">{user.email}</span>
                  </div>
                  <p className="text-sm text-gray-500">Email cannot be changed</p>
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-gray-500" />
                    <Badge variant={user.role === "agency" ? "default" : "secondary"}>
                      {user.role === "agency" ? "Travel Agency" : "Traveler"}
                    </Badge>
                  </div>
                </div>

                {/* Edit Actions */}
                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        setEditName(user.name)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Travel Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Travel Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{totalTrips}</div>
                    <div className="text-sm text-gray-500">Total Trips</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{upcomingTrips}</div>
                    <div className="text-sm text-gray-500">Upcoming</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{countries}</div>
                    <div className="text-sm text-gray-500">Countries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{cities}</div>
                    <div className="text-sm text-gray-500">Cities</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={handleBackToDashboard}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/trips/new")}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Plan New Trip
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Trips */}
        {trips.length > 0 && (
          <>
            <Separator className="my-8" />
            <Card>
              <CardHeader>
                <CardTitle>Recent Trips</CardTitle>
                <CardDescription>Your latest travel adventures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trips.slice(0, 5).map((trip) => (
                    <div key={trip.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{trip.title}</h4>
                        <p className="text-sm text-gray-500">{trip.countries?.join(", ") || "No destinations set"}</p>
                        {trip.start_date && (
                          <p className="text-xs text-gray-400">{format(new Date(trip.start_date), "MMM d, yyyy")}</p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/trips/${trip.id}`)}>
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
