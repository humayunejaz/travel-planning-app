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
import { Plane, AlertCircle, CheckCircle, Users, MapPin } from "lucide-react"
import { authService } from "@/lib/auth"
import { invitationsService } from "@/lib/invitations"
import { tripsService } from "@/lib/trips"
import { isSupabaseAvailable } from "@/lib/supabase"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [invitation, setInvitation] = useState<any>(null)
  const [tripDetails, setTripDetails] = useState<any>(null)
  const [isLoadingInvitation, setIsLoadingInvitation] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const invitationToken = searchParams.get("invitation")
  const tripId = searchParams.get("trip")

  useEffect(() => {
    const loadInvitation = async () => {
      if (invitationToken) {
        setIsLoadingInvitation(true)
        try {
          console.log("Loading invitation with token:", invitationToken)

          const invitationData = await invitationsService.getInvitationByToken(invitationToken)
          console.log("Invitation data:", invitationData)

          if (invitationData) {
            setInvitation(invitationData)

            // Pre-fill email if available
            setFormData((prev) => ({
              ...prev,
              email: invitationData.email,
            }))

            // Load trip details
            if (invitationData.trip_id) {
              const trip = await tripsService.getTripById(invitationData.trip_id)
              console.log("Trip details:", trip)
              setTripDetails(trip)
            }
          } else {
            setError("Invalid or expired invitation link")
          }
        } catch (error) {
          console.error("Error loading invitation:", error)
          setError("Failed to load invitation details")
        } finally {
          setIsLoadingInvitation(false)
        }
      }
    }

    loadInvitation()
  }, [invitationToken])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    if (!formData.name.trim()) {
      setError("Please enter your full name")
      setIsLoading(false)
      return
    }

    try {
      console.log("Starting registration process...")

      const signupResult = await authService.signUp(formData.email, formData.password, formData.name, "traveler")
      console.log("Signup result:", signupResult)

      if (signupResult.user) {
        // If there's an invitation, accept it
        if (invitation && invitationToken) {
          try {
            console.log("Accepting invitation...")
            await invitationsService.acceptInvitation(invitationToken)

            if (tripDetails) {
              setSuccess(`Account created successfully! You've been added to "${tripDetails.title}".`)
            } else {
              setSuccess("Account created successfully! You've been added to the trip.")
            }

            // Redirect to dashboard after a short delay
            setTimeout(() => {
              router.push("/dashboard")
            }, 2000)
          } catch (invError) {
            console.error("Error accepting invitation:", invError)
            // Still redirect to dashboard even if invitation acceptance fails
            router.push("/dashboard")
          }
        } else {
          // Regular registration without invitation
          console.log("Registration successful, redirecting to dashboard...")
          router.push("/dashboard")
        }
      }
    } catch (error: any) {
      console.error("Registration error:", error)

      // Provide user-friendly error messages
      let errorMessage = "Failed to create account. Please try again."

      if (error.message) {
        if (error.message.includes("User already registered") || error.message.includes("already exists")) {
          errorMessage = "An account with this email already exists. Please sign in instead."
        } else if (error.message.includes("Invalid email")) {
          errorMessage = "Please enter a valid email address."
        } else if (error.message.includes("Password")) {
          errorMessage = "Password must be at least 6 characters long."
        } else if (error.message.includes("configuration") || error.message.includes("API key")) {
          errorMessage = "Service configuration error. Using demo mode instead."
          // In this case, try demo mode
          try {
            const mockUser = {
              id: `mock-${Date.now()}`,
              email: formData.email,
              name: formData.name,
              role: "traveler" as const,
            }
            localStorage.setItem("mockUser", JSON.stringify(mockUser))
            localStorage.setItem("isAuthenticated", "true")

            // Accept invitation in demo mode
            if (invitation && invitationToken) {
              await invitationsService.acceptInvitation(invitationToken)
            }

            router.push("/dashboard")
            return
          } catch (demoError) {
            errorMessage = "Registration failed. Please try again later."
          }
        } else {
          errorMessage = error.message
        }
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (isLoadingInvitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading invitation...</p>
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
          <p className="text-gray-600">
            {invitation ? "Join the trip and start planning!" : "Start planning your adventures"}
          </p>
        </div>

        {/* Invitation Details */}
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
                <p className="text-sm text-blue-700">You've been invited to collaborate on this trip!</p>
                {tripDetails.countries && tripDetails.countries.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tripDetails.countries.slice(0, 3).map((country: string) => (
                      <span key={country} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {country}
                      </span>
                    ))}
                    {tripDetails.countries.length > 3 && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        +{tripDetails.countries.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {!isSupabaseAvailable() && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Demo Mode:</strong> Supabase not configured. Registration will work in demo mode with mock data.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{invitation ? "Accept Invitation & Create Account" : "Create your account"}</CardTitle>
            <CardDescription>
              {invitation
                ? "Create your account to join the trip and start collaborating"
                : "Join thousands of travelers worldwide"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading || !!invitation}
                />
                {invitation && <p className="text-xs text-gray-500">Email pre-filled from invitation</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password (min 6 characters)"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? "Creating Account..."
                  : invitation
                    ? "Accept Invitation & Create Account"
                    : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href={invitation ? `/?invitation=${invitationToken}&trip=${tripId}` : "/"}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
            <p>
              <strong>Debug Info:</strong>
            </p>
            <p>Supabase Available: {isSupabaseAvailable() ? "Yes" : "No"}</p>
            <p>Invitation Token: {invitationToken || "None"}</p>
            <p>Trip ID: {tripId || "None"}</p>
            <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing"}</p>
            <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing"}</p>
          </div>
        )}
      </div>
    </div>
  )
}
