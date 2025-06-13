"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, CheckCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface EmailConfirmationHelperProps {
  email: string
  onClose: () => void
}

export function EmailConfirmationHelper({ email, onClose }: EmailConfirmationHelperProps) {
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState("")

  const handleResendConfirmation = async () => {
    setIsResending(true)
    setResendError("")
    setResendSuccess(false)

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      })

      if (error) throw error
      setResendSuccess(true)
    } catch (error: any) {
      setResendError(error.message || "Failed to resend confirmation email")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-900">
          <Mail className="h-5 w-5 mr-2" />
          Email Confirmation Required
        </CardTitle>
        <CardDescription className="text-orange-800">
          Please check your email and click the confirmation link to activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <p className="text-sm text-orange-800">
            We sent a confirmation email to <strong>{email}</strong>
          </p>

          <div className="bg-orange-100 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-900 font-medium mb-2">What to do:</p>
            <ol className="text-sm text-orange-800 space-y-1 list-decimal list-inside">
              <li>Check your email inbox for a message from Supabase</li>
              <li>Click the "Confirm your email" link in the email</li>
              <li>Return here and try signing in again</li>
            </ol>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Can't find the email?</strong> Check your spam/junk folder. The email might take a few minutes to
              arrive.
            </AlertDescription>
          </Alert>

          {resendSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Email sent!</strong> Check your inbox for a new confirmation email.
              </AlertDescription>
            </Alert>
          )}

          {resendError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{resendError}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleResendConfirmation}
            disabled={isResending}
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            {isResending ? "Sending..." : "Resend Confirmation Email"}
          </Button>
          <Button onClick={onClose} variant="outline">
            I'll Check My Email
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
