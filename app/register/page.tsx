"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, UserPlus, Mail } from "lucide-react"
import { authService } from "@/lib/auth"
import { invitationsService } from "@/lib/invitations"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"traveler" | "agency">("traveler")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invitationInfo, setInvitationInfo] = useState<{
    tripTitle: string
    inviterName: string
    token: string
    tripId: string
  } | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for invitation parameters on page load
  useEffect(() => {
    const invitationToken = searchParams.get("invitation")
    const tripId = searchParams.get("trip")

    if (invitationToken && tripId) {
      console.log("🎯 Invitation detected:", { invitationToken, tripId })

      // Load invitation details
      invitationsService
        .getInvitationByToken(invitationToken)
        .then((invitation) => {
          if (invitation) {
            console.log("✅ Valid invitation found:", invitation)
            setInvitationInfo({
              tripTitle: "Trip Invitation", // We'll get this from the trip data
              inviterName: "Trip Organizer", // We'll get this from the user data
              token: invitationToken,
              tripId: tripId,
            })

            // Pre-fill email if it's in the invitation
            if (invitation.email) {
              setEmail(invitation.email)
            }
          } else {
            console.log("❌ Invalid or expired invitation")
            setError("This invitation link is invalid or has expired.")
          }
        })
        .catch((err) => {
          console.error("Error loading invitation:", err)
          setError("Error loading invitation details.")
        })
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log("Registration attempt:", { email, name, role, hasInvitation: !!invitationInfo })

      const result = await authService.signUp(email, password, name, role)

      if (result.user) {
        console.log("Registration successful:", result.user)

        // Set authentication in localStorage for immediate access
        if (typeof window !== "undefined") {
          localStorage.setItem("isAuthenticated", "true")
        }

        // If there's an invitation, accept it
        if (invitationInfo) {
          console.log("🎯 Accepting invitation after registration...")
          try {
            const accepted = await invitationsService.acceptInvitation(invitationInfo.token)
            if (accepted) {
              console.log("✅ Invitation accepted successfully")
            } else {
              console.log("⚠️ Could not accept invitation, but registration was successful")
            }
          } catch (inviteError) {
            console.error("Error accepting invitation:", inviteError)
            // Don't fail the whole flow if invitation acceptance fails
          }
        }

        // Wait a moment for any async operations to complete
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Redirect based on role or invitation
        if (invitationInfo) {
          console.log("Redirecting to trip after invitation...")
          router.push(`/trips/${invitationInfo.tripId}`)
        } else if (role === "agency") {
          console.log("Redirecting to agency dashboard...")
          router.push("/agency")
        } else {
          console.log("Redirecting to traveler dashboard...")
          router.push("/dashboard")
        }
      }
    } catch (err: any) {
      console.error("Registration error:", err)
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to home
          </Link>
          <div className="text-center">
            <UserPlus className="mx-auto h-12 w-12 text-blue-600" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {invitationInfo ? "Join the Trip!" : "Create your account"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {invitationInfo ? (
                "Complete your registration to join the trip"
              ) : (
                <>
                  Or{" "}
                  <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    sign in to your existing account
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Invitation Info Card */}
        {invitationInfo && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-blue-900">Trip Invitation</h3>
                  <p className="text-sm text-blue-700">
                    You've been invited to collaborate on a trip. Complete your registration below to join!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              {invitationInfo
                ? "Create your account to join the trip"
                : "Choose your account type and enter your details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!invitationInfo && (
                <div>
                  <Label htmlFor="role">Account Type</Label>
                  <Select value={role} onValueChange={(value: "traveler" | "agency") => setRole(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="traveler">Traveler - Plan and manage your trips</SelectItem>
                      <SelectItem value="agency">Travel Agency - Manage client trips</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!!invitationInfo} // Disable if email came from invitation
                />
                {invitationInfo && <p className="text-xs text-gray-500 mt-1">Email pre-filled from your invitation</p>}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? "Creating account..."
                  : invitationInfo
                    ? "Create Account & Join Trip"
                    : `Create ${role === "agency" ? "Agency" : "Traveler"} Account`}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-600">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
