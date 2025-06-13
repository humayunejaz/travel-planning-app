"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plane, MapPin, Users, Building, AlertCircle } from "lucide-react"
import { authService } from "@/lib/auth"
import { isSupabaseAvailable } from "@/lib/supabase"
import { invitationsService } from "@/lib/invitations"
import { tripsService } from "@/lib/trips"
import { EmailConfirmationHelper } from "@/components/email-confirmation-helper"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)
  const [invitation, setInvitation] = useState<any>(null)
  const [tripDetails, setTripDetails] = useState<any>(null)
  const searchParams = useSearchParams()
  const invitationToken = searchParams.get("invitation")
  const tripId = searchParams.get("trip")
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndInvitation = async () => {
      // Load invitation if present
      if (invitationToken) {
        try {
          const invitationData = await invitationsService.getInvitationByToken(invitationToken)
          if (invitationData) {
            setInvitation(invitationData)
            setEmail(invitationData.email) // Pre-fill email

            // Load trip details
            if (invitationData.trip_id) {
              const trip = await tripsService.getTripById(invitationData.trip_id)
              setTripDetails(trip)
            }
          }
        } catch (error) {
          console.error("Error loading invitation:", error)
        }
      }

      // Check if user is already logged in
      try {
        const user = await authService.getCurrentUser()
        if (user) {
          console.log("User already logged in:", user)
          if (user.role === "agency") {
            router.push("/agency")
          } else {
            router.push("/dashboard")
          }
        }
      } catch (error) {
        console.log("No existing session found or error:", error)
        // Don't do anything on error - just let the user stay on the login page
      }
    }

    checkAuthAndInvitation().catch((err) => {
      console.error("Error in checkAuthAndInvitation:", err)
      // Don't redirect or show error - just let the user stay on the login page
    })
  }, [router, invitationToken])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setShowEmailConfirmation(false)
    setIsLoading(true)

    try {
      console.log("Starting login process...")
      const { data } = await authService.signIn(email, password)

      if (data?.user) {
        console.log("Login successful, getting user profile...")

        // If there's an invitation, accept it
        if (invitation && invitationToken) {
          try {
            await invitationsService.acceptInvitation(invitationToken)
            console.log("Invitation accepted after login")
          } catch (invError) {
            console.error("Error accepting invitation:", invError)
          }
        }

        // Get the current user to determine role
        const currentUser = await authService.getCurrentUser()
        console.log("Current user:", currentUser)

        if (currentUser?.role === "agency") {
          console.log("Redirecting to agency dashboard")
          router.push("/agency")
        } else {
          console.log("Redirecting to user dashboard")
          router.push("/dashboard")
        }
      }
    } catch (error: any) {
      console.error("Login error:", error)

      // Check if it's an email confirmation error
      if (error.message?.includes("Email not confirmed") || error.message?.includes("confirmation link")) {
        setShowEmailConfirmation(true)
        setError("")
      } else {
        setError(error.message || "Failed to sign in. Please check your credentials.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Show email confirmation helper if needed
  if (showEmailConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Plane className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-3xl font-bold text-gray-900">TravelPlan</h1>
            </div>
          </div>
          <EmailConfirmationHelper email={email} onClose={() => setShowEmailConfirmation(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Plane className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">TravelPlan</h1>
          </div>
          <p className="text-gray-600">Plan your perfect journey</p>
        </div>

        {!isSupabaseAvailable() && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Demo Mode:</strong> Supabase not configured. Use these test accounts:
              <br />
              <strong>Traveler:</strong> user@example.com / password
              <br />
              <strong>Agency:</strong> agency@example.com / password
            </AlertDescription>
          </Alert>
        )}

        {invitation && tripDetails && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-blue-900">
                <Users className="h-5 w-5 mr-2" />
                Trip Invitation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-medium text-blue-900">{tripDetails.title}</span>
                </div>
                <p className="text-sm text-blue-700">Sign in to accept your trip invitation!</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {"Don't have an account? "}
                <Link
                  href={invitation ? `/register?invitation=${invitationToken}&trip=${tripId}` : "/register"}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign up
                </Link>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Choose between Traveler or Travel Agency account during registration
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-center">
                <Link href="/agency/login">
                  <Button variant="outline" className="flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    Travel Agency Login
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              Plan destinations
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              Invite friends
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
