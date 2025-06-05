"use client"

import { useState } from "react"

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
  const [newCountry, setNewCountry] = useState
