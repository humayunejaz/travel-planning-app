"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function ConfirmPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        setIsLoading(true)

        // Check if we have a hash fragment in the URL
        const hash = window.location.hash

        if (hash && hash.includes("access_token") && hash.includes("refresh_token")) {
          console.log("Found tokens in URL hash, processing confirmation...")

          // Process the email confirmation
          const { data, error } = await supabase.auth.getSession()

          if (error) {
            console.error("Error getting session:", error)
            setError("Failed to confirm email. Please try again or contact support.")
            setIsLoading(false)
            return
          }

          if (data?.session?.user) {
            console.log("Email confirmed successfully, user:", data.session.user.id)

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

            setSuccess(true)
            setIsLoading(false)

            // Redirect after a short delay
            setTimeout(() => {
              router.push("/dashboard")
            }, 2000)
            return
          }
        }

        // Check if we have a token in the URL
        const token = searchParams.get("token")
        const type = searchParams.get("type")

        if (token) {
          console.log("Found token in URL, processing confirmation...")

          // Process the email confirmation
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type === "recovery" ? "recovery" : "email",
          })

          if (error) {
            console.error("Error verifying token:", error)
            setError(error.message || "Failed to confirm email. Please try again or contact support.")
            setIsLoading(false)
            return
          }

          // Get the user
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (!user) {
            setError("User not found")
            setIsLoading(false)
            return
          }

          // Check if profile exists
          const { data: profile } = await supabase.from("profiles").select().eq("id", user.id).single()

          // Create profile if it doesn't exist
          if (!profile) {
            const { error: profileError } = await supabase.from("profiles").insert({
              id: user.id,
              email: user.email!,
              name: user.user_metadata.name || user.email!.split("@")[0],
              role: user.user_metadata.role || "traveler",
            })

            if (profileError) {
              console.error("Error creating profile:", profileError)
            }
          }

          setSuccess(true)
          setIsLoading(false)

          // Redirect after a short delay
          setTimeout(() => {
            router.push("/dashboard")
          }, 2000)
          return
        }

        // If we get here, we don't have valid confirmation parameters
        setError("Invalid confirmation link. Missing required parameters.")
        setIsLoading(false)
      } catch (err: any) {
        console.error("Email confirmation error:", err)
        setError(err.message || "An error occurred during confirmation")
        setIsLoading(false)
      }
    }

    confirmEmail()
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Confirmation</CardTitle>
          <CardDescription>Verifying your email address</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-center text-sm text-gray-500">Verifying your email address...</p>
            </div>
          ) : success ? (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Your email has been verified. You will be redirected to the dashboard.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-red-500 bg-red-50">
              <XCircle className="h-5 w-5 text-red-500" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {!isLoading && <Button onClick={() => router.push("/")}>Return to Home</Button>}
        </CardFooter>
      </Card>
    </div>
  )
}
