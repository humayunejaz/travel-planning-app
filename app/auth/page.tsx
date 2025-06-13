"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plane, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function EmailConfirmationPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Check if we have a hash fragment in the URL
        const hash = window.location.hash

        if (hash && hash.includes("access_token") && hash.includes("refresh_token")) {
          console.log("Found tokens in URL hash, processing confirmation...")

          // Process the email confirmation
          const { data, error } = await supabase.auth.getSession()

          if (error) {
            console.error("Error getting session:", error)
            setStatus("error")
            setMessage("Failed to confirm email. Please try again or contact support.")
            return
          }

          if (data?.session?.user) {
            console.log("Email confirmed successfully, user:", data.session.user.id)
            setUserId(data.session.user.id)

            // Ensure profile exists
            try {
              const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", data.session.user.id)
                .single()

              if (profileError || !profile) {
                console.log("Creating profile after email confirmation...")
                const metadata = data.session.user.user_metadata || {}

                const { error: insertError } = await supabase.from("profiles").upsert({
                  id: data.session.user.id,
                  email: data.session.user.email || "",
                  name: metadata.name || data.session.user.email?.split("@")[0] || "User",
                  role: (metadata.role as "traveler" | "agency") || "traveler",
                })

                if (insertError) {
                  console.warn("Error creating profile after confirmation:", insertError)
                } else {
                  console.log("Profile created after email confirmation")
                }
              } else {
                console.log("Profile already exists:", profile)
              }
            } catch (profileError) {
              console.warn("Error checking/creating profile:", profileError)
            }

            setStatus("success")
            setMessage("Your email has been confirmed successfully!")
          } else {
            console.error("No user in session after confirmation")
            setStatus("error")
            setMessage("Failed to confirm email. Please try again or contact support.")
          }
        } else {
          // Check if we have a code in the URL
          const code = searchParams.get("code")

          if (code) {
            console.log("Found code in URL, processing confirmation...")

            // Process the email confirmation
            const { data, error } = await supabase.auth.exchangeCodeForSession(code)

            if (error) {
              console.error("Error exchanging code for session:", error)
              setStatus("error")
              setMessage("Failed to confirm email. Please try again or contact support.")
              return
            }

            if (data?.user) {
              console.log("Email confirmed successfully, user:", data.user.id)
              setUserId(data.user.id)

              // Ensure profile exists
              try {
                const { data: profile, error: profileError } = await supabase
                  .from("profiles")
                  .select("*")
                  .eq("id", data.user.id)
                  .single()

                if (profileError || !profile) {
                  console.log("Creating profile after email confirmation...")
                  const metadata = data.user.user_metadata || {}

                  const { error: insertError } = await supabase.from("profiles").upsert({
                    id: data.user.id,
                    email: data.user.email || "",
                    name: metadata.name || data.user.email?.split("@")[0] || "User",
                    role: (metadata.role as "traveler" | "agency") || "traveler",
                  })

                  if (insertError) {
                    console.warn("Error creating profile after confirmation:", insertError)
                  } else {
                    console.log("Profile created after email confirmation")
                  }
                } else {
                  console.log("Profile already exists:", profile)
                }
              } catch (profileError) {
                console.warn("Error checking/creating profile:", profileError)
              }

              setStatus("success")
              setMessage("Your email has been confirmed successfully!")
            } else {
              console.error("No user returned after confirmation")
              setStatus("error")
              setMessage("Failed to confirm email. Please try again or contact support.")
            }
          } else {
            console.error("No confirmation code or tokens found in URL")
            setStatus("error")
            setMessage("Invalid confirmation link. Please try again or contact support.")
          }
        }
      } catch (error) {
        console.error("Email confirmation error:", error)
        setStatus("error")
        setMessage("An unexpected error occurred. Please try again or contact support.")
      }
    }

    handleEmailConfirmation()
  }, [searchParams])

  const handleContinue = () => {
    const redirectTo = userId ? "/dashboard" : "/"
    router.push(redirectTo)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Plane className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">TravelPlan</h1>
          </div>
          <p className="text-gray-600">Email Confirmation</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Email Confirmation</CardTitle>
            <CardDescription>Verifying your email address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "loading" && (
              <div className="flex flex-col items-center justify-center py-4">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">Verifying your email address...</p>
              </div>
            )}

            {status === "success" && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <Button onClick={handleContinue} className="w-full" disabled={status === "loading"}>
              {status === "success" ? "Continue to Dashboard" : "Back to Sign In"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



