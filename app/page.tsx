"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plane, MapPin, Users, Building } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("Starting login process...")
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error)
        setError(error.message || "Failed to sign in. Please check your credentials.")
        setIsLoading(false)
        return
      }

      if (data.user) {
        console.log("Login successful, getting user profile...")

        // Check if profile exists, create if it doesn't
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (profileError && !profileError.message.includes("No rows found")) {
          console.error("Error fetching profile:", profileError)
        }

        if (!profile) {
          console.log("Profile not found, creating one...")
          const { error: insertError } = await supabase.from("profiles").insert({
            id: data.user.id,
            email: data.user.email || "",
            name: data.user.user_metadata?.name || data.user.email?.split("@")[0] || "User",
            role: (data.user.user_metadata?.role as "traveler" | "agency") || "traveler",
          })

          if (insertError) {
            console.error("Error creating profile:", insertError)
          } else {
            console.log("Profile created successfully")
          }
        }

        // Get the current user to determine role
        const { data: userData } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()
        console.log("Current user:", userData)

        if (userData?.role === "agency") {
          console.log("Redirecting to agency dashboard")
          router.push("/agency")
        } else {
          console.log("Redirecting to user dashboard")
          router.push("/dashboard")
        }
      }
    } catch (error: any) {
      console.error("Login error:", error)
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
            <h1 className="text-3xl font-bold text-gray-900">TravelPlan</h1>
          </div>
          <p className="text-gray-600">Plan your perfect journey</p>
        </div>

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
                <Link href="/register" className="text-blue-600 hover:underline font-medium">
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
