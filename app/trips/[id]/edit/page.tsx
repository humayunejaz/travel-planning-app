"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, X, Plane, MapPin, Calendar, Users, Trash2 } from "lucide-react"

interface Trip {
  id: string
  title: string
  description?: string
  countries: string[]
  cities: string[]
  startDate: string
  endDate: string
  collaborators: string[]
  status: "planning" | "confirmed" | "completed"
  userId?: string
  userName?: string
  userEmail?: string
}

export default function EditTripPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [newCountry, setNewCountry] = useState("")
  const [newCity, setNewCity] = useState("")
  const [newCollaborator, setNewCollaborator] = useState("")
  const router = useRouter()
  const params = useParams()
  const tripId = params.id as string

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated")
    const userRole = localStorage.getItem("userRole")

    if (!authStatus || userRole !== "traveler") {
      router.push("/")
      return
    }
    setIsAuthenticated(true)

    // Load trip data
    const trips = JSON.parse(localStorage.getItem("trips") || "[]")
    const foundTrip = trips.find((t: Trip) => t.id === tripId)
    if (foundTrip) {
      setTrip(foundTrip)
    } else {
      router.push("/dashboard")
    }
  }, [router, tripId])

  const updateTrip = (updates: Partial<Trip>) => {
    if (!trip) return
    const updatedTrip = { ...trip, ...updates }
    setTrip(updatedTrip)
  }

  const addCountry = () => {
    if (newCountry.trim() && trip && !trip.countries.includes(newCountry.trim())) {
      updateTrip({
        countries: [...trip.countries, newCountry.trim()],
      })
      setNewCountry("")
    }
  }

  const removeCountry = (country: string) => {
    if (!trip) return
    updateTrip({
      countries: trip.countries.filter((c) => c !== country),
    })
  }

  const addCity = () => {
    if (newCity.trim() && trip && !trip.cities.includes(newCity.trim())) {
      updateTrip({
        cities: [...trip.cities, newCity.trim()],
      })
      setNewCity("")
    }
  }

  const removeCity = (city: string) => {
    if (!trip) return
    updateTrip({
      cities: trip.cities.filter((c) => c !== city),
    })
  }

  const addCollaborator = () => {
    if (newCollaborator.trim() && trip && !trip.collaborators.includes(newCollaborator.trim())) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (emailRegex.test(newCollaborator.trim())) {
        updateTrip({
          collaborators: [...trip.collaborators, newCollaborator.trim()],
        })
        setNewCollaborator("")
      } else {
        alert("Please enter a valid email address")
      }
    }
  }

  const removeCollaborator = (email: string) => {
    if (!trip) return
    updateTrip({
      collaborators: trip.collaborators.filter((c) => c !== email),
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!trip || !trip.title || !trip.startDate || !trip.endDate) {
      alert("Please fill in all required fields")
      return
    }

    // Save updated trip
    const trips = JSON.parse(localStorage.getItem("trips") || "[]")
    const updatedTrips = trips.map((t: Trip) => (t.id === trip.id ? trip : t))
    localStorage.setItem("trips", JSON.stringify(updatedTrips))

    router.push("/dashboard")
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this trip? This action cannot be undone.")) {
      const trips = JSON.parse(localStorage.getItem("trips") || "[]")
      const updatedTrips = trips.filter((t: Trip) => t.id !== tripId)
      localStorage.setItem("trips", JSON.stringify(updatedTrips))
      router.push("/dashboard")
    }
  }

  if (!isAuthenticated || !trip) {
    return <div>Loading...</div>
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
                <h1 className="text-xl font-semibold text-gray-900">Edit Trip</h1>
              </div>
            </div>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Trip
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Trip Details
              </CardTitle>
              <CardDescription>Basic information about your trip</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Trip Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., European Summer Adventure"
                  value={trip.title}
                  onChange={(e) => updateTrip({ title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your trip plans..."
                  value={trip.description || ""}
                  onChange={(e) => updateTrip({ description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={trip.startDate}
                    onChange={(e) => updateTrip({ startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={trip.endDate}
                    onChange={(e) => updateTrip({ endDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={trip.status}
                    onValueChange={(value: "planning" | "confirmed" | "completed") => updateTrip({ status: value })}
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
            </CardContent>
          </Card>

          {/* Destinations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Destinations
              </CardTitle>
              <CardDescription>Add countries and cities you plan to visit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Countries */}
              <div className="space-y-3">
                <Label>Countries</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a country"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCountry())}
                  />
                  <Button type="button" onClick={addCountry}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trip.countries.map((country) => (
                    <Badge key={country} variant="secondary" className="flex items-center gap-1">
                      {country}
                      <button
                        type="button"
                        onClick={() => removeCountry(country)}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Cities */}
              <div className="space-y-3">
                <Label>Cities</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a city"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCity())}
                  />
                  <Button type="button" onClick={addCity}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trip.cities.map((city) => (
                    <Badge key={city} variant="outline" className="flex items-center gap-1">
                      {city}
                      <button
                        type="button"
                        onClick={() => removeCity(city)}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Collaborators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Collaborators
              </CardTitle>
              <CardDescription>Invite others to help plan this trip</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email address"
                  type="email"
                  value={newCollaborator}
                  onChange={(e) => setNewCollaborator(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCollaborator())}
                />
                <Button type="button" onClick={addCollaborator}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {trip.collaborators.map((email) => (
                  <Badge key={email} className="flex items-center gap-1">
                    {email}
                    <button
                      type="button"
                      onClick={() => removeCollaborator(email)}
                      className="ml-1 hover:bg-blue-700 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Link href="/dashboard">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </main>
    </div>
  )
}
