"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ExternalLink, CheckCircle, AlertCircle, Copy, Eye, EyeOff, ArrowRight, Zap } from "lucide-react"

export function ResendSetupGuide() {
  const [showApiKey, setShowApiKey] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [isTestingEmail, setIsTestingEmail] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const hasResendKey = process.env.NEXT_PUBLIC_RESEND_CONFIGURED === "true"

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  const testEmailSending = async () => {
    if (!testEmail) {
      alert("Please enter an email address to test")
      return
    }

    setIsTestingEmail(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/send-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientEmail: testEmail,
          tripTitle: "Test Trip - Email Setup",
          inviterName: "TravelPlan Setup",
          inviterEmail: "setup@travelplan.com",
          invitationToken: "test-token-" + Date.now(),
          tripId: "test-trip-id",
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setTestResult({
          success: true,
          message: `✅ Test email sent successfully to ${testEmail}!`,
        })
      } else {
        setTestResult({
          success: false,
          message: `❌ ${result.error || "Failed to send test email"}`,
        })
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `❌ Network error: ${error}`,
      })
    } finally {
      setIsTestingEmail(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">Email Setup with Resend</h1>
        <p className="text-gray-600 mt-2">Configure email invitations for trip collaborators</p>
      </div>

      {/* Status Card */}
      <Card className={hasResendKey ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {hasResendKey ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              )}
              <div>
                <h3 className="text-lg font-semibold">{hasResendKey ? "✅ Resend Configured" : "⚠️ Setup Required"}</h3>
                <p className="text-sm text-gray-600">
                  {hasResendKey
                    ? "Email service is ready to send invitations"
                    : "Add your Resend API key to enable email invitations"}
                </p>
              </div>
            </div>
            <Badge variant={hasResendKey ? "default" : "secondary"}>{hasResendKey ? "Active" : "Inactive"}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Setup Steps */}
      <div className="grid gap-6">
        {/* Step 1: Get Resend API Key */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                1
              </span>
              Get Your Resend API Key
            </CardTitle>
            <CardDescription>Sign up for Resend and get your API key</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Visit Resend Dashboard</p>
                <p className="text-sm text-gray-600">Create account and get your API key</p>
              </div>
              <Button variant="outline" asChild>
                <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Resend
                </a>
              </Button>
            </div>

            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                <strong>Free Tier:</strong> Resend offers 3,000 emails/month for free. Perfect for testing and small
                projects!
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Step 2: Add Environment Variable */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                2
              </span>
              Add Environment Variable
            </CardTitle>
            <CardDescription>Add your Resend API key to your environment variables</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="env-example">Add this to your .env.local file:</Label>
              <div className="mt-2 relative">
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                  RESEND_API_KEY={showApiKey ? "re_your_actual_api_key_here" : "re_••••••••••••••••••••"}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => copyToClipboard("RESEND_API_KEY=re_your_actual_api_key_here")}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Template
              </Button>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Replace "re_your_actual_api_key_here" with your real API key from Resend.
                Restart your development server after adding the environment variable.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Step 3: Test Email Sending */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                3
              </span>
              Test Email Sending
            </CardTitle>
            <CardDescription>Send a test invitation email to verify everything works</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="test-email">Test Email Address</Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="your-email@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={testEmailSending}
                  disabled={isTestingEmail || !testEmail}
                  className="whitespace-nowrap"
                >
                  {isTestingEmail ? "Sending..." : "Send Test"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>

            {testResult && (
              <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={testResult.success ? "text-green-800" : "text-red-800"}>
                  {testResult.message}
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> In Resend's testing mode, you can only send emails to your verified email
                address. To send to other recipients, verify a domain at resend.com/domains.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Step 4: How It Works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                ✓
              </span>
              How Email Invitations Work
            </CardTitle>
            <CardDescription>Understanding the complete invitation flow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-blue-800 text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Create Trip & Add Collaborators</p>
                  <p className="text-sm text-gray-600">When creating a trip, add collaborator email addresses</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-blue-800 text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium">Email Sent Automatically</p>
                  <p className="text-sm text-gray-600">
                    Resend sends a beautiful invitation email with registration link
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-blue-800 text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium">Collaborator Registers</p>
                  <p className="text-sm text-gray-600">
                    They click the link, create an account, and are automatically added to the trip
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-green-100 rounded-full p-2">
                  <span className="text-green-800 text-sm font-bold">✓</span>
                </div>
                <div>
                  <p className="font-medium">Start Collaborating</p>
                  <p className="text-sm text-gray-600">They can now view and edit the trip details together</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center space-x-4 pt-6">
        <Button variant="outline" asChild>
          <a href="/trips/new">Create Test Trip</a>
        </Button>
        <Button asChild>
          <a href="/dashboard">Go to Dashboard</a>
        </Button>
      </div>
    </div>
  )
}
