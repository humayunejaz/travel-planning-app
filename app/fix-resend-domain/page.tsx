"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, ExternalLink, Mail, Shield, Zap, Copy } from "lucide-react"

export default function FixResendDomainPage() {
  const [testEmail, setTestEmail] = useState("humayunejazm@gmail.com")
  const [isTestingVerified, setIsTestingVerified] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const testWithVerifiedEmail = async () => {
    setIsTestingVerified(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/send-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientEmail: testEmail,
          tripTitle: "Test Trip - Domain Fix",
          inviterName: "Test User",
          inviterEmail: "test@example.com",
          invitationToken: "test-token-" + Date.now(),
          tripId: "test-trip-123",
        }),
      })

      const result = await response.json()
      setTestResult({
        success: response.ok,
        data: result,
        status: response.status,
      })
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        status: 500,
      })
    } finally {
      setIsTestingVerified(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Shield className="h-8 w-8 text-green-600" />
          Resend Domain Issue - SOLVED!
        </h1>
        <p className="text-gray-600">Your API key works! You just need domain verification for other emails.</p>
      </div>

      {/* Status */}
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />✅ Your API Key is Working!
          </CardTitle>
          <CardDescription className="text-green-700">
            The 403 error means your API key is valid, but Resend has domain restrictions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-100 text-green-800">
                API Key: Valid ✅
              </Badge>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Domain: Not Verified ⚠️
              </Badge>
            </div>
            <p className="text-green-700 text-sm">
              <strong>Current limitation:</strong> You can only send emails to{" "}
              <code className="bg-green-100 px-1 rounded">humayunejazm@gmail.com</code>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Test with Your Email */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />🧪 Test Email (Should Work Now)
          </CardTitle>
          <CardDescription>Test sending to your verified email address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verified-email">Your Verified Email</Label>
            <Input
              id="verified-email"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="font-mono"
            />
            <p className="text-sm text-gray-600">This should work since it's your verified email address</p>
          </div>

          <Button onClick={testWithVerifiedEmail} disabled={isTestingVerified} className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {isTestingVerified ? "Sending..." : "Send Test Email"}
          </Button>

          {testResult && (
            <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <div className="flex items-start gap-2">
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <AlertDescription>
                    <strong>{testResult.success ? "✅ Success!" : "❌ Still Failed"}</strong>
                    <br />
                    {testResult.success ? (
                      <span>Email sent successfully! Check your inbox.</span>
                    ) : (
                      <span>Error: {testResult.data?.error || testResult.error}</span>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Solutions */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Quick Solution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Zap className="h-5 w-5" />🚀 Quick Solution (For Testing)
            </CardTitle>
            <CardDescription>Get your app working immediately</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-2">
                <strong>For now, only invite your own email:</strong>
              </p>
              <code className="text-xs bg-blue-100 px-2 py-1 rounded">humayunejazm@gmail.com</code>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">✅ This will work immediately</p>
              <p className="text-sm font-medium">✅ You can test the full collaboration flow</p>
              <p className="text-sm font-medium">✅ Perfect for development and demos</p>
            </div>
          </CardContent>
        </Card>

        {/* Production Solution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-600">
              <Shield className="h-5 w-5" />🏢 Production Solution
            </CardTitle>
            <CardDescription>Send emails to anyone</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm">
                <strong>1. Verify a domain at</strong>{" "}
                <a
                  href="https://resend.com/domains"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  resend.com/domains <ExternalLink className="h-3 w-3" />
                </a>
              </p>
              <p className="text-sm">
                <strong>2. Update the "from" address</strong> in your email service
              </p>
              <p className="text-sm">
                <strong>3. Send emails to any recipient</strong>
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Verify Domain
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Code Update for Production */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>📝 Code Update (After Domain Verification)</CardTitle>
          <CardDescription>Update your email service to use your verified domain</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Current "from" address:</p>
              <code className="text-sm bg-gray-100 px-3 py-2 rounded block">
                from: "TravelPlan &lt;onboarding@resend.dev&gt;"
              </code>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Update to your domain:</p>
              <code className="text-sm bg-green-100 px-3 py-2 rounded block">
                from: "TravelPlan &lt;noreply@yourdomain.com&gt;"
              </code>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => copyToClipboard('from: "TravelPlan <noreply@yourdomain.com>"')}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>File to update:</strong> <code>app/api/send-invitation/route.ts</code> - Change the "from" field
                in the resend.emails.send() call
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">🎉 Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-green-700">
            <p>✅ Your Resend API key is working perfectly</p>
            <p>✅ The error was about domain verification, not invalid key</p>
            <p>✅ You can send emails to humayunejazm@gmail.com right now</p>
            <p>✅ For other recipients, verify a domain at resend.com/domains</p>
            <p>✅ Your collaboration system is ready to use!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
