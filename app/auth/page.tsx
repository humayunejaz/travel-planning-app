"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function ConfirmPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        setIsLoading(true)

        // Get the token and type from the URL
        const token_hash = searchParams.get("token_hash")
        const type = searchParams.get("type")

        if (!token_hash || !type) {
          setError("Missing confirmation parameters")
          setIsLoading(false)
          return
        }

        // Verify the email
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any,
        })

        if (error) {
          setError(error.message)
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
      } catch (err: any) {
        setError(err.message || "An error occurred during confirmation")
        setIsLoading(false)
      }
    }

    confirmEmail()
  }, [searchParams, router, supabase])

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
