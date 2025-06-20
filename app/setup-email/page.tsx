"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Mail, ExternalLink, Copy } from "lucide-react"

export default function EmailSetupPage() {
  const [testEmail, setTestEmail] = useState("")
  const [isTestingEmail, setIsTestingEmail] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [apiKeyStatus, setApiKeyStatus] = useState<"checking" | "configured" | "missing">("checking")

  // Check API key status on component mount
  useEffect(() => {
    checkApiKeyStatus()
  }, [])

  const checkApiKeyStatus = async () => {
    try {
      const response = await fetch("/api/check-email-config")
      const data = await response.json()
      setApiKeyStatus(data.configured ? "configured" : "missing")
    } catch (error) {
      setApiKeyStatus("missing")
    }
  }

  const testEmailSystem = async () => {
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
          tripTitle: "Test Trip to Paris",
          inviterName: "Demo User",
          inviterEmail: "demo@example.com",
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
      setIsTestingEmail(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📧 Email System Setup</h1>
        <p className="text-gray-600">Configure and test your email invitation system</p>
      </div>

      {/* API Key Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Resend API Configuration
          </CardTitle>
          <CardDescription>Check if your Resend API key is properly configured</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            {apiKeyStatus === "configured" ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-4 w-4 mr-1" />
                API Key Configured
              </Badge>
            ) : apiKeyStatus === "missing" ? (
              <Badge variant="destructive">
                <AlertCircle className="h-4 w-4 mr-1" />
                API Key Missing
              </Badge>
            ) : (
              <Badge variant="secondary">Checking...</Badge>
            )}
          </div>

          {apiKeyStatus === "missing" && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Setup Required:</strong> You need to add your Resend API key to your environment variables.
                <br />
                <br />
                <strong>Steps:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>
                    Go to{" "}
                    <a
                      href="https://resend.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      Resend API Keys <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>Create a new API key</li>
                  <li>Add it to your .env.local file as: RESEND_API_KEY=your_key_here</li>
                  <li>Restart your development server</li>
                </ol>
              </AlertDescription>
            </Alert>
          )}

          <Button variant="outline" onClick={checkApiKeyStatus} disabled={apiKeyStatus === "checking"}>
            {apiKeyStatus === "checking" ? "Checking..." : "Recheck Configuration"}
          </Button>
        </CardContent>
      </Card>

      {/* Domain Verification Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Domain Verification (Required for Production)
          </CardTitle>
          <CardDescription>To send emails to any recipient, you need to verify a domain with Resend</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Current Limitation:</strong> You can only send emails to your own email address
              (humayunejazm@gmail.com) until you verify a domain.
              <br />
              <br />
              <strong>To send emails to collaborators:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>
                  Go to{" "}
                  <a
                    href="https://resend.com/domains"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    Resend Domains <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>Add and verify your domain (e.g., yourdomain.com)</li>
                <li>Update the "from" address in the email service to use your domain</li>
                <li>Or use a subdomain like: noreply@yourdomain.com</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">🚀 Quick Setup Options:</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p>
                <strong>Option 1:</strong> Use your existing domain (recommended)
              </p>
              <p>
                <strong>Option 2:</strong> Register a new domain for your app
              </p>
              <p>
                <strong>Option 3:</strong> Use a free subdomain service
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🧪 Test Email System</CardTitle>
          <CardDescription>Send a test invitation email to verify everything works</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="testEmail">Test Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                placeholder="your-email@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">Enter your email to receive a test invitation</p>
            </div>

            <Button onClick={testEmailSystem} disabled={isTestingEmail || !testEmail}>
              {isTestingEmail ? "Sending Test Email..." : "Send Test Email"}
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
                      <strong>{testResult.success ? "✅ Success!" : "❌ Failed"}</strong>
                      <br />
                      {testResult.success ? (
                        <div className="mt-2">
                          <p>Test email sent successfully to {testEmail}</p>
                          {testResult.data?.invitationLink && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                              <p className="text-sm font-medium text-blue-900 mb-2">Invitation Link:</p>
                              <div className="flex items-center gap-2">
                                <code className="text-xs bg-white px-2 py-1 rounded border flex-1 break-all">
                                  {testResult.data.invitationLink}
                                </code>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(testResult.data.invitationLink)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-2">
                          <p>Error: {testResult.data?.error || testResult.error}</p>
                          {testResult.data?.code && <p className="text-sm">Code: {testResult.data.code}</p>}
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Next Steps</CardTitle>
          <CardDescription>Once email is working, here's what you can do</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                1
              </div>
              <p>Test the email system above</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                2
              </div>
              <p>Create a trip and add collaborators to test the full flow</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                3
              </div>
              <p>Customize email templates and styling</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                4
              </div>
              <p>Add email notifications for trip updates</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
