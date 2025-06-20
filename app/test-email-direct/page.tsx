"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { invitationsService } from "@/lib/invitations"

export default function TestEmailDirectPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState("")
  const [error, setError] = useState("")

  const testEmailDirect = async () => {
    if (!email) {
      setError("Please enter an email address")
      return
    }

    setIsLoading(true)
    setError("")
    setResult("")

    try {
      console.log("=== TESTING EMAIL DIRECT ===")
      console.log("Email:", email)

      const success = await invitationsService.sendInvitationEmail(
        "test-trip-123",
        "Test Trip from Direct Test",
        email,
        "Test User",
        "test@example.com",
      )

      if (success) {
        setResult(`✅ Email sent successfully to ${email}!`)
      } else {
        setError(`❌ Failed to send email to ${email}`)
      }
    } catch (error: any) {
      console.error("Direct email test error:", error)
      setError(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Direct Email Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Enter email to test"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button onClick={testEmailDirect} disabled={isLoading} className="w-full">
              {isLoading ? "Sending..." : "Send Test Email"}
            </Button>

            {result && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">{result}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-gray-600">
              <p>
                <strong>Debug Info:</strong>
              </p>
              <p>• Check browser console for detailed logs</p>
              <p>• Make sure RESEND_API_KEY is set in environment</p>
              <p>• Check Network tab for API call details</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
