"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authService } from "@/lib/auth"

export default function FixTripAccessPage() {
  const [user, setUser] = useState<any>(null)
  const [trips, setTrips] = useState<any[]>([])
  const [fixed, setFixed] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)

      const localTrips = JSON.parse(localStorage.getItem("trips") || "[]")
      setTrips(localTrips)
    }
    loadData()
  }, [])

  const fixAllTrips = () => {
    if (!user) return

    const updatedTrips = trips.map((trip) => ({
      ...trip,
      user_id: user.id, // Set all trips to current user ID
    }))

    localStorage.setItem("trips", JSON.stringify(updatedTrips))
    setTrips(updatedTrips)
    setFixed(true)

    alert(`Fixed ${trips.length} trips to use your current user ID: ${user.id}`)
  }

  const clearAllTrips = () => {
    if (confirm("Are you sure you want to delete all trips? This cannot be undone.")) {
      localStorage.removeItem("trips")
      setTrips([])
      alert("All trips cleared!")
    }
  }

  if (!user) {
    return <div className="p-8">Loading user...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🔧 Fix Trip Access Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-semibold">Current User Info:</h3>
              <p>ID: {user.id}</p>
              <p>Email: {user.email}</p>
              <p>Role: {user.role}</p>
            </div>

            <div className="bg-yellow-50 p-4 rounded">
              <h3 className="font-semibold">Found {trips.length} trips in localStorage</h3>
              {trips.length > 0 && (
                <div className="mt-2 space-y-1">
                  {trips.map((trip, index) => (
                    <div key={trip.id} className="text-sm">
                      {index + 1}. {trip.title} (Owner: {trip.user_id})
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button onClick={fixAllTrips} disabled={trips.length === 0 || fixed}>
                {fixed ? "✅ Fixed!" : `Fix All ${trips.length} Trips`}
              </Button>
              <Button variant="destructive" onClick={clearAllTrips} disabled={trips.length === 0}>
                Clear All Trips
              </Button>
            </div>

            {fixed && (
              <div className="bg-green-50 p-4 rounded">
                <p className="text-green-700">
                  ✅ All trips have been updated to use your current user ID. Try editing a trip now!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
