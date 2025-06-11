"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plane, Building, AlertCircle } from "lucide-react"
import { authService } from "@/lib/auth"
import { isSupabaseAvailable } from "@/lib/supabase"

export default function AgencyLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Update the handleLogin function to properly handle the authentication flow
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!isSupabaseAvailable()) {
        // Mock login for agency - in demo mode
        if (email === "agency@example.com" && password === "password") {
          const mockAgencyUser = {
            id: "mock-agency-1",
            email: "agency@example.com",
            name: "Agency Admin",
            role: "agency",
          }
          localStorage.setItem("mockUser", JSON.stringify(mockAgencyUser))
          localStorage.setItem("isAuthenticated", "true")
          router.push("/agency")
          return
        } else {
          throw new Error("Invalid email or password")
        }
      }

      // Real Supabase authentication
      const { user } = await authService.signIn(email, password)

      if (user) {
        // Get user profile to check role
        const currentUser = await authService.getCurrentUser()
        if (currentUser?.role === "agency") {
          router.push("/agency")
        } else {
          setError("This account is not authorized for agency access")
        }
      }
    } catch (error: any) {
      console.error("Agency login error:", error)
      setError(error.message || "Failed to sign in. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Plane className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">
              TravelPlan <span className="text-blue-600">Agency</span>
            </h1>
          </div>
          <p className="text-gray-600">Travel agency portal</p>
        </div>

        {!isSupabaseAvailable() && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Demo Mode:</strong> Use these test credentials:
              <br />
              <strong>Email:</strong> agency@example.com
              <br />
              <strong>Password:</strong> password
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Agency Login
            </CardTitle>
            <CardDescription>Sign in to access the agency dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="agency@example.com"
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
                {"Not an agency? "}
                <a href="/" className="text-blue-600 hover:underline font-medium">
                  Traveler login
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
