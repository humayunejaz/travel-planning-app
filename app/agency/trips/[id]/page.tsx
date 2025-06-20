"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, XCircle, Save, Edit, CheckCircle, RefreshCw } from "lucide-react"
import { tripsService } from "@/lib/trips"
import { authService } from "@/lib/auth"

export default function TripDetailsPage({ params }) {
  const [trip, setTrip] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [refreshKey, setRefreshKey] = useState(0) // Used to force refresh
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: "",
    countries: [],
    cities: [],
    start_date: "",
    end_date: "",
  })
  const router = useRouter()

  // Load trip details
  const loadTripDetails = async () => {
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
      console.log("Loading trip with ID:", params.id)
      const tripData = await tripsService.getTripById(params.id)
      if (!tripData) {
        setError("Trip not found")
        return
      }

      console.log("Loaded trip data:", tripData)
      setTrip(tripData)
      setEditForm({
        title: tripData.title || "",
        description: tripData.description || "",
        status: tripData.status || "planning",
        countries: tripData.countries || [],
        cities: tripData.cities || [],
        start_date: tripData.start_date ? tripData.start_date.split("T")[0] : "",
        end_date: tripData.end_date ? tripData.end_date.split("T")[0] : "",
      })
    } catch (err) {
      console.error("Error loading trip details:", err)
      setError("Failed to load trip details")
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadTripDetails()
  }, [params.id, router, refreshKey]) // refreshKey triggers reload

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setSaveMessage("")
      setError(null)

      console.log("Saving trip with ID:", trip.id)
      console.log("Form data:", editForm)

      const updates = {
        title: editForm.title,
        description: editForm.description,
        status: editForm.status,
        countries: editForm.countries,
        cities: editForm.cities,
        start_date: editForm.start_date || null,
        end_date: editForm.end_date || null,
      }

      console.log("Updates to apply:", updates)

      // Try to update the trip
      await tripsService.updateTrip(trip.id, updates)

      // Force a refresh of the data
      setRefreshKey((prev) => prev + 1)
      setIsEditing(false)
      setSaveMessage("Trip updated successfully!")

      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(""), 3000)
    } catch (err) {
      console.error("Error updating trip:", err)
      setError(`Failed to update trip: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleCancel = () => {
    setEditForm({
      title: trip.title || "",
      description: trip.description || "",
      status: trip.status || "planning",
      countries: trip.countries || [],
      cities: trip.cities || [],
      start_date: trip.start_date ? trip.start_date.split("T")[0] : "",
      end_date: trip.end_date ? trip.end_date.split("T")[0] : "",
    })
    setIsEditing(false)
    setError(null)
    setSaveMessage("")
  }

  const handleCountriesChange = (value: string) => {
    const countries = value
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c)
    setEditForm({ ...editForm, countries })
  }

  const handleCitiesChange = (value: string) => {
    const cities = value
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c)
    setEditForm({ ...editForm, cities })
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
        {saveMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">{saveMessage}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{trip.title}</h1>
            <p className="text-gray-600 mt-1">Trip ID: {trip.id}</p>
            <p className="text-gray-600">Client ID: {trip.user_id.substring(0, 8)}...</p>
            <p className="text-gray-600">
              {trip.start_date && trip.end_date
                ? `${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}`
                : "Dates not set"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(trip.status)}>{trip.status}</Badge>
            {!isEditing ? (
              <>
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Trip
                </Button>
                <Button variant="outline" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
            <CardDescription>
              {isEditing ? "Edit trip information" : "Complete information about this trip"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Trip Title</Label>
                    <Input
                      id="title"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={editForm.status}
                      onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={editForm.start_date}
                      onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={editForm.end_date}
                      onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="countries">Countries (comma-separated)</Label>
                  <Input
                    id="countries"
                    value={editForm.countries.join(", ")}
                    onChange={(e) => handleCountriesChange(e.target.value)}
                    placeholder="e.g., France, Italy, Spain"
                  />
                </div>

                <div>
                  <Label htmlFor="cities">Cities (comma-separated)</Label>
                  <Input
                    id="cities"
                    value={editForm.cities.join(", ")}
                    onChange={(e) => handleCitiesChange(e.target.value)}
                    placeholder="e.g., Paris, Rome, Barcelona"
                  />
                </div>
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
