"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Plane, Plus, X, Loader2, AlertCircle, CheckCircle, Mail } from "lucide-react"
import { authService } from "@/lib/auth"
import { tripsService } from "@/lib/trips"
import { invitationsService } from "@/lib/invitations"

interface UserType {
  id: string
  name: string
  email: string
  role: string
}

export default function NewTripPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [emailStatus, setEmailStatus] = useState<{ [key: string]: "sending" | "sent" | "failed" }>({})

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [countries, setCountries] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [collaborators, setCollaborators] = useState<string[]>([])
  const [newCountry, setNewCountry] = useState("")
  const [newCity, setNewCity] = useState("")
  const [newCollaborator, setNewCollaborator] = useState("")

  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        if (!currentUser) {
          router.push("/login")
          return
        }
        if (currentUser.role === "agency") {
          router.push("/agency")
          return
        }
        setUser(currentUser)
      } catch (err) {
        console.error("Error loading user:", err)
        setError("Error loading user data")
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  const addCountry = () => {
    if (newCountry.trim() && !countries.includes(newCountry.trim())) {
      setCountries([...countries, newCountry.trim()])
      setNewCountry("")
    }
  }

  const removeCountry = (country: string) => {
    setCountries(countries.filter((c) => c !== country))
  }

  const addCity = () => {
    if (newCity.trim() && !cities.includes(newCity.trim())) {
      setCities([...cities, newCity.trim()])
      setNewCity("")
    }
  }

  const removeCity = (city: string) => {
    setCities(cities.filter((c) => c !== city))
  }

  const addCollaborator = () => {
    const email = newCollaborator.trim().toLowerCase()
    if (email && !collaborators.includes(email) && email !== user?.email?.toLowerCase()) {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (emailRegex.test(email)) {
        setCollaborators([...collaborators, email])
        setNewCollaborator("")
      } else {
        setError("Please enter a valid email address")
        setTimeout(() => setError(null), 3000)
      }
    }
  }

  const removeCollaborator = (email: string) => {
    setCollaborators(collaborators.filter((c) => c !== email))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    setError(null)
    setSuccess(null)
    setEmailStatus({})

    try {
      console.log("=== CREATING TRIP WITH COLLABORATORS ===")
      console.log("User:", user)
      console.log("Title:", title)
      console.log("Collaborators:", collaborators)

      // Create the trip
      const tripData = {
        title: title.trim(),
        description: description.trim() || undefined,
        countries: countries.length > 0 ? countries : undefined,
        cities: cities.length > 0 ? cities : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      }

      console.log("Creating trip with data:", tripData)
      const trip = await tripsService.createTrip(tripData, collaborators, user.id)
      console.log("✅ Trip created successfully:", trip)

      // Send invitation emails if there are collaborators
      if (collaborators.length > 0) {
        console.log("📧 Sending invitation emails...")
        setSuccess(`Trip "${trip.title}" created successfully! Sending invitations...`)

        for (const email of collaborators) {
          try {
            console.log(`Sending invitation to: ${email}`)
            setEmailStatus((prev) => ({ ...prev, [email]: "sending" }))

            const result = await invitationsService.sendInvitation({
              tripId: trip.id,
              tripTitle: trip.title,
              inviterName: user.name || user.email,
              inviterEmail: user.email,
              inviteeEmail: email,
            })

            console.log(`✅ Invitation sent to ${email}:`, result)
            setEmailStatus((prev) => ({ ...prev, [email]: "sent" }))
          } catch (emailError) {
            console.error(`❌ Failed to send invitation to ${email}:`, emailError)
            setEmailStatus((prev) => ({ ...prev, [email]: "failed" }))
          }
        }

        const sentCount = Object.values(emailStatus).filter((status) => status === "sent").length
        const failedCount = Object.values(emailStatus).filter((status) => status === "failed").length

        if (failedCount === 0) {
          setSuccess(`Trip created and ${collaborators.length} invitations sent successfully!`)
        } else {
          setSuccess(`Trip created! ${sentCount} invitations sent, ${failedCount} failed.`)
        }
      } else {
        setSuccess(`Trip "${trip.title}" created successfully!`)
      }

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/trips/${trip.id}`)
      }, 2000)
    } catch (err: any) {
      console.error("❌ Error creating trip:", err)
      setError(err.message || "Failed to create trip")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Plane className="h-6 w-6 text-blue-600 mr-2" />
          <h1 className="text-xl font-bold text-gray-900">Create New Trip</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
              <CardDescription>Basic information about your trip</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Trip Title *
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Summer Europe Adventure"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your trip..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Destinations</CardTitle>
              <CardDescription>Countries and cities you plan to visit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Countries</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    placeholder="Add a country"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCountry())}
                  />
                  <Button type="button" onClick={addCountry} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {countries.map((country) => (
                    <Badge key={country} variant="secondary" className="flex items-center gap-1">
                      {country}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeCountry(country)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cities</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Add a city"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCity())}
                  />
                  <Button type="button" onClick={addCity} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cities.map((city) => (
                    <Badge key={city} variant="secondary" className="flex items-center gap-1">
                      {city}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeCity(city)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Collaborators</CardTitle>
              <CardDescription>Invite others to help plan and view this trip</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Addresses</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newCollaborator}
                    onChange={(e) => setNewCollaborator(e.target.value)}
                    placeholder="Enter email address"
                    type="email"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCollaborator())}
                  />
                  <Button type="button" onClick={addCollaborator} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {collaborators.map((email) => (
                    <div key={email} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{email}</span>
                        {emailStatus[email] === "sending" && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
                        {emailStatus[email] === "sent" && <CheckCircle className="h-3 w-3 text-green-500" />}
                        {emailStatus[email] === "failed" && <AlertCircle className="h-3 w-3 text-red-500" />}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCollaborator(email)}
                        disabled={submitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                {collaborators.length > 0 && (
                  <p className="text-xs text-gray-600 mt-2">
                    📧 Invitation emails will be sent automatically when you create the trip
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={submitting || !title.trim()} className="flex-1">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Trip...
                </>
              ) : (
                "Create Trip"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
