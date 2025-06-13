"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plane, AlertCircle, CheckCircle, Users, Building } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "traveler" as "traveler" | "agency",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    console.log("🚀 Starting registration process...")

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
      console.log("📝 Creating account for:", formData.email)

      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role,
          },
        },
      })

      if (error) {
        console.error("Supabase signup error:", error)
        setError(error.message || "Registration failed. Please try again.")
        setIsLoading(false)
        return
      }

      if (data.user) {
        console.log("User created successfully:", data.user.id)

        // Create profile immediately
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: formData.email,
          name: formData.name,
          role: formData.role,
        })

        if (profileError) {
          console.error("Error creating profile:", profileError)
        } else {
          console.log("Profile created successfully")
        }

        // Check if email confirmation is needed
        if (!data.user.email_confirmed_at) {
          console.log("📧 Email confirmation required")
          setSuccess(
            `🎉 Account created successfully! Please check your email (${formData.email}) and click the confirmation link to activate your account.`,
          )
          setIsLoading(false)
        } else {
          // Account is ready to use
          const redirectPath = formData.role === "agency" ? "/agency" : "/dashboard"
          console.log(`🏠 Registration successful, redirecting to ${redirectPath}...`)
          setSuccess(
            `🎉 Account created successfully! Redirecting to ${formData.role === "agency" ? "agency dashboard" : "dashboard"}...`,
          )
          setTimeout(() => {
            router.push(redirectPath)
          }, 1500)
        }
      }
    } catch (error: any) {
      console.error("💥 Registration error:", error)

      let errorMessage = "Failed to create account. Please try again."

      if (error.message) {
        if (error.message.includes("User already registered") || error.message.includes("already exists")) {
          errorMessage = "An account with this email already exists. Please sign in instead."
        } else if (error.message.includes("Invalid email")) {
          errorMessage = "Please enter a valid email address."
        } else if (error.message.includes("Password")) {
          errorMessage = "Password must be at least 6 characters long."
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Plane className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">TravelPlan</h1>
          </div>
          <p className="text-gray-600">Start planning your adventures</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Join thousands of travelers worldwide</CardDescription>
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
                <Label htmlFor="role">Account Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={formData.role === "traveler" ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, role: "traveler" })}
                    disabled={isLoading}
                    className="flex items-center justify-center"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Traveler
                  </Button>
                  <Button
                    type="button"
                    variant={formData.role === "agency" ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, role: "agency" })}
                    disabled={isLoading}
                    className="flex items-center justify-center"
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Travel Agency
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  {formData.role === "traveler"
                    ? "Plan and organize your personal trips"
                    : "Manage trips for your travel agency clients"}
                </p>
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
                  disabled={isLoading}
                />
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
                  : `Create ${formData.role === "agency" ? "Agency" : "Traveler"} Account`}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/" className="text-blue-600 hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
