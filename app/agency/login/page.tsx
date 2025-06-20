"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft } from "lucide-react"

export default function AgencyLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log("Agency login attempt with:", { email, password })

      // Demo mode authentication - only allow agency login
      if (email === "agency@example.com" && password === "password") {
        const mockUser = {
          id: "agency123456",
          email,
          name: "Agency Admin",
          role: "agency",
        }

        localStorage.setItem("mockUser", JSON.stringify(mockUser))
        localStorage.setItem("isAuthenticated", "true")

        console.log("Agency login successful:", mockUser)
        router.push("/agency")
        return
      }

      // Check for registered mock users with agency role
      const mockUsers = JSON.parse(localStorage.getItem("mockUsers") || "[]")
      const foundUser = mockUsers.find((user: any) => user.email === email && user.role === "agency")

      if (foundUser) {
        localStorage.setItem("mockUser", JSON.stringify(foundUser))
        localStorage.setItem("isAuthenticated", "true")

        console.log("Registered agency user login successful:", foundUser)
        router.push("/agency")
        return
      }

      setError("Invalid agency credentials")
    } catch (err) {
      console.error("Login error:", err)
      setError("An error occurred during login. Please try again.")
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
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Agency Login</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Sign in to access your agency dashboard</p>
        </div>

        {/* Demo Mode Alert */}
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Demo Mode Active</strong> - Use these agency credentials:
            <div className="mt-2 bg-white p-2 rounded border border-yellow-200">
              <div>
                <strong>Agency User:</strong>
              </div>
              <div className="font-mono text-sm">agency@example.com / password</div>
            </div>
          </AlertDescription>
        </Alert>

        {error && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <Label htmlFor="email-address" className="sr-only">
                Email address
              </Label>
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="rounded-t-md"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password" className="sr-only">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="rounded-b-md"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in to Agency Portal"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
