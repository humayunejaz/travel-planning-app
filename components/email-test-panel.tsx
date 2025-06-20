"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, X, CheckCircle, AlertCircle } from "lucide-react"

export function EmailTestPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testEmailSending = async () => {
    if (!testEmail) {
      alert("Please enter an email address")
      return
    }

    setIsLoading(true)
    setResult(null)

    console.log("🧪 === EMAIL TEST STARTING ===")
    console.log("📧 Test email:", testEmail)

    try {
      console.log("📤 Calling test email API...")

      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientEmail: testEmail,
          tripTitle: "Test Trip from v0",
          inviterName: "Test User",
          inviterEmail: "test@example.com",
          invitationToken: "test-token-123",
          tripId: "test-trip-123",
        }),
      })

      console.log("📨 API Response status:", response.status)

      const data = await response.json()
      console.log("📋 API Response data:", data)

      setResult({
        success: response.ok,
        status: response.status,
        data: data,
      })

      if (response.ok) {
        console.log("✅ Test email sent successfully!")
      } else {
        console.error("❌ Test email failed:", data)
      }
    } catch (error) {
      console.error("💥 Test email error:", error)
      setResult({
        success: false,
        error: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="fixed bottom-32 right-4 z-40">
        <Mail className="h-4 w-4 mr-2" />
        Test Email
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Test Email Sending</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testEmail">Your Email Address</Label>
            <Input
              id="testEmail"
              type="email"
              placeholder="your@email.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
            <p className="text-xs text-gray-500">We'll send a test email to this address</p>
          </div>

          <Button onClick={testEmailSending} disabled={isLoading} className="w-full">
            {isLoading ? "Sending..." : "Send Test Email"}
          </Button>

          {result && (
            <div className="mt-4 p-3 rounded-lg border">
              <div className="flex items-center mb-2">
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                )}
                <span className="font-medium">{result.success ? "Success!" : "Failed"}</span>
              </div>

              <div className="text-sm space-y-1">
                <p>
                  <strong>Status:</strong> {result.status || "Error"}
                </p>
                {result.data?.message && (
                  <p>
                    <strong>Message:</strong> {result.data.message}
                  </p>
                )}
                {result.data?.error && (
                  <p className="text-red-600">
                    <strong>Error:</strong> {result.data.error}
                  </p>
                )}
                {result.error && (
                  <p className="text-red-600">
                    <strong>Error:</strong> {result.error}
                  </p>
                )}
              </div>

              {result.success && (
                <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                  ✅ Check your email inbox (and spam folder) for the test email!
                </div>
              )}
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1">
            <p>
              <strong>Debug:</strong> Check browser console for detailed logs
            </p>
            <p>
              <strong>Note:</strong> Make sure RESEND_API_KEY is set in environment variables
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
