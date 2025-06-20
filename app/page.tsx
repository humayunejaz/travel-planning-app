"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plane, Users, MapPin, Calendar, ArrowRight, Mail, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const searchParams = useSearchParams()
  const [invitationData, setInvitationData] = useState<{
    token: string
    tripId: string
  } | null>(null)

  useEffect(() => {
    const invitation = searchParams.get("invitation")
    const trip = searchParams.get("trip")

    // Only set invitation data if BOTH parameters are present
    if (invitation && trip) {
      setInvitationData({ token: invitation, tripId: trip })
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Invitation Banner - Only show if there's invitation data */}
      {invitationData && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="h-6 w-6" />
                <div>
                  <p className="font-semibold">You've been invited to join a trip!</p>
                  <p className="text-blue-100 text-sm">Create an account or sign in to accept your invitation</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link href={`/register?invitation=${invitationData.token}&trip=${invitationData.tripId}`}>
                  <Button variant="secondary" size="sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Invitation
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-white hover:bg-white hover:text-blue-600"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Plane className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">TravelPlan</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              ✈️ Plan Together, Travel Better
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Perfect Trip
              <span className="text-blue-600"> Starts Here</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Collaborate with friends, plan amazing itineraries, track budgets, and create unforgettable memories
              together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8">
                  Start Planning
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-lg px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Plan Together</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From initial ideas to final itineraries, manage every aspect of your group travel in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Collaborate in Real-Time</CardTitle>
                <CardDescription>
                  Invite friends and family to plan together. Everyone can contribute ideas, vote on activities, and
                  stay in sync.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Calendar className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Smart Itinerary Builder</CardTitle>
                <CardDescription>
                  Create detailed day-by-day plans with activities, reservations, and travel times. Never miss a moment.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <MapPin className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Destination Discovery</CardTitle>
                <CardDescription>
                  Explore destinations, find hidden gems, and get personalized recommendations based on your group's
                  interests.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Next Adventure?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-blue-100">
            Join thousands of travelers who use TravelPlan to create amazing group trips.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Plane className="h-6 w-6" />
              <span className="text-xl font-bold">TravelPlan</span>
            </div>
            <p className="text-gray-400">© 2024 TravelPlan. Made for travelers, by travelers.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
