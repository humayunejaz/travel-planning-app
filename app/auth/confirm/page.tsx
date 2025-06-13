"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Loader2, Plane } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function ConfirmPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        console.log("=== EMAIL CONFIRMATION ===")

        // Get the token and type from URL parameters
        const token = searchParams.get("token")
        const type = searchParams.get("type")

        console.log("Token:", token)
        console.log("Type:", type)

        if (!token) {
          setStatus("error")
          setMessage("Invalid confirmation link. No token found.")
          return
        }

        // Verify the email using Supabase
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type === "recovery" ? "recovery" : "email",
        })

        console.log("Verification result:", { data, error })

        if (error) {
          console.error("Verification error:", error)
          setStatus("error")
          setMessage(error.message || "Failed to confirm email. The link may have expired.")
          return
        }

        if (data.user) {
          console.log("Email confirmed successfully for user:", data.user.id)

          // Create or update profile
          try {
            const { error: profileError } = await supabase.from("profiles").upsert({
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.name || data.user.email?.split("@")[0] || "User",
              role: data.user.user_metadata?.role || "traveler",
            })

            if (profileError) {
              console.warn("Profile creation error:", profileError)
            } else {
              console.log("Profile created/updated successfully")
            }
          } catch (profileError) {
            console.warn("Error creating profile:", profileError)
          }

          setStatus("success")
          setMessage("Your email has been confirmed successfully! You can now sign in to your account.")
        } else {
          setStatus("error")
          setMessage("Email confirmation failed. Please try again or contact support.")
        }
      } catch (error: any) {
        console.error("Confirmation error:", error)
        setStatus("error")
        setMessage("An unexpected error occurred. Please try again later.")
      }
    }

    confirmEmail()
  }, [searchParams])

  const handleContinue = () => {
    if (status === "success") {
      router.push("/")
    } else {
      router.push("/register")
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
          <p className="text-gray-600">Email Confirmation</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {status === "loading" && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
              {status === "success" && <CheckCircle className="h-5 w-5 mr-2 text-green-600" />}
              {status === "error" && <AlertCircle className="h-5 w-5 mr-2 text-red-600" />}

              {status === "loading" && "Confirming Email..."}
              {status === "success" && "Email Confirmed!"}
              {status === "error" && "Confirmation Failed"}
            </CardTitle>
            <CardDescription>
              {status === "loading" && "Please wait while we confirm your email address."}
              {status === "success" && "Your account is now active and ready to use."}
              {status === "error" && "There was a problem confirming your email address."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className={`mb-4 ${status === "success" ? "" : "border-red-200 bg-red-50"}`}>
              {status === "success" && <CheckCircle className="h-4 w-4" />}
              {status === "error" && <AlertCircle className="h-4 w-4" />}
              <AlertDescription>{message}</AlertDescription>
            </Alert>

            {status !== "loading" && (
              <Button onClick={handleContinue} className="w-full">
                {status === "success" ? "Continue to Sign In" : "Back to Registration"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
