"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Info } from "lucide-react"

export default function TestWithYourEmailPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testCollaborationFlow = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      console.log("🧪 Testing collaboration flow with your email...")

      // Test 1: Create a collaboration entry
      const collaborationResponse = await fetch("/api/test-collaboration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collaboratorEmail: "humayunejazm@gmail.com", // Your verified email
          tripTitle: "Test Trip to Tokyo",
        }),
      })

      const collaborationData = await collaborationResponse.json()

      // Test 2: Send email invitation
      const emailResponse = await fetch("/api/send-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: "humayunejazm@gmail.com", // Your verified email
          tripTitle: "Test Trip to Tokyo",
          inviterName: "Test User",
          inviterEmail: "test@example.com",
          invitationToken: "test-token-" + Date.now(),
          tripId: "test-trip-123",
        }),
      })

      const emailData = await emailResponse.json()

      setResult({
        collaboration: {
          success: collaborationResponse.ok,
          data: collaborationData,
        },
        email: {
          success: emailResponse.ok,
          data: emailData,
        },
      })
    } catch (error) {
      setResult({
        error: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🧪 Test Collaboration (Your Email Only)</h1>
        <p className="text-gray-600">Test the full collaboration flow using your verified email address</p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Testing Mode:</strong> This test uses your verified email address (humayunejazm@gmail.com) since
          Resend is in testing mode.
          <br />
          To test with other emails, you need to verify a domain at{" "}
          <a
            href="https://resend.com/domains"
            target="_blank"
            className="text-blue-600 hover:underline"
            rel="noreferrer"
          >
            resend.com/domains
          </a>
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🎯 Full Flow Test</CardTitle>
          <CardDescription>This will test both database collaboration creation and email sending</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={testCollaborationFlow} disabled={isLoading} className="w-full">
            {isLoading ? "Testing..." : "Test Full Collaboration Flow"}
          </Button>

          {result && (
            <div className="mt-6 space-y-4">
              {/* Collaboration Test Result */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {result.collaboration?.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <h3 className="font-medium">Database Collaboration</h3>
                </div>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(result.collaboration, null, 2)}
                </pre>
              </div>

              {/* Email Test Result */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {result.email?.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <h3 className="font-medium">Email Sending</h3>
                </div>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(result.email, null, 2)}
                </pre>
              </div>

              {result.error && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Error:</strong> {result.error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📋 Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline">1</Badge>
              <div>
                <p className="font-medium">Test with your email (above)</p>
                <p className="text-sm text-gray-600">Verify the system works with your verified email</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline">2</Badge>
              <div>
                <p className="font-medium">Verify a domain at Resend</p>
                <p className="text-sm text-gray-600">Go to resend.com/domains to add your domain</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline">3</Badge>
              <div>
                <p className="font-medium">Update the "from" email address</p>
                <p className="text-sm text-gray-600">Change from "onboarding@resend.dev" to "noreply@yourdomain.com"</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline">4</Badge>
              <div>
                <p className="font-medium">Test with external emails</p>
                <p className="text-sm text-gray-600">Once domain is verified, test with any email address</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
