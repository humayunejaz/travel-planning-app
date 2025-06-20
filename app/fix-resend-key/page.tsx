"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, CheckCircle, ExternalLink, Copy, Eye, EyeOff, RefreshCw, Key, Server, Mail } from "lucide-react"

export default function FixResendKeyPage() {
  const [newApiKey, setNewApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    valid: boolean
    message: string
    details?: any
  } | null>(null)

  const validateApiKey = async (keyToTest: string) => {
    if (!keyToTest) {
      alert("Please enter an API key to validate")
      return
    }

    setIsValidating(true)
    setValidationResult(null)

    try {
      const response = await fetch("/api/test-resend-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: keyToTest }),
      })

      const result = await response.json()
      setValidationResult(result)
    } catch (error) {
      setValidationResult({
        valid: false,
        message: `Error testing API key: ${error}`,
      })
    } finally {
      setIsValidating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-red-600">API Key Invalid</h1>
            <p className="text-gray-600">Let's fix your Resend API key issue</p>
          </div>
        </div>

        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Error:</strong> Your current Resend API key is invalid (401 validation_error). This means the key is
            either wrong, expired, or doesn't exist.
          </AlertDescription>
        </Alert>
      </div>

      {/* Step 1: Get New API Key */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              1
            </span>
            Get a Fresh API Key
          </CardTitle>
          <CardDescription>Your current key is invalid. Let's get a new one from Resend.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">Visit Resend Dashboard</h4>
                <p className="text-sm text-blue-700">Sign in and create a new API key</p>
              </div>
              <Button asChild>
                <a
                  href="https://resend.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Resend
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Steps in Resend Dashboard:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Sign in to your Resend account</li>
              <li>Go to "API Keys" section</li>
              <li>Click "Create API Key"</li>
              <li>Give it a name (e.g., "TravelPlan App")</li>
              <li>Select "Full access" permission</li>
              <li>Click "Add" and copy the key immediately</li>
            </ol>
          </div>

          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Copy the API key immediately after creation. Resend only shows it once for
              security reasons.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Step 2: Test New Key */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              2
            </span>
            Test Your New API Key
          </CardTitle>
          <CardDescription>Paste your new API key here to verify it works before adding to environment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-api-key">New API Key from Resend</Label>
            <div className="relative">
              <Input
                id="new-api-key"
                type={showApiKey ? "text" : "password"}
                placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                className="pr-10"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button
            onClick={() => validateApiKey(newApiKey)}
            disabled={!newApiKey || isValidating}
            className="flex items-center gap-2"
          >
            {isValidating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            {isValidating ? "Validating..." : "Test This Key"}
          </Button>

          {validationResult && (
            <Alert className={validationResult.valid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {validationResult.valid ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={validationResult.valid ? "text-green-800" : "text-red-800"}>
                {validationResult.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Update Environment */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              3
            </span>
            Update Environment Variable
          </CardTitle>
          <CardDescription>Add your working API key to your .env.local file</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Add this line to your .env.local file:</Label>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm relative">
              <div>RESEND_API_KEY={newApiKey || "re_your_new_api_key_here"}</div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-green-400 hover:text-green-300"
                onClick={() => copyToClipboard(`RESEND_API_KEY=${newApiKey || "re_your_new_api_key_here"}`)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">File Location:</h4>
            <p className="text-sm text-yellow-800">
              The <code>.env.local</code> file should be in your project root directory (same level as package.json).
              Create it if it doesn't exist.
            </p>
          </div>

          <Alert>
            <Server className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> After updating .env.local, you MUST restart your development server:
              <br />
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">npm run dev</code>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Step 4: Verify Fix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              ✓
            </span>
            Verify Everything Works
          </CardTitle>
          <CardDescription>Test the complete email flow after updating your API key</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <Button variant="outline" asChild>
              <a href="/debug-resend">
                <CheckCircle className="h-4 w-4 mr-2" />
                Run Full Diagnostic
              </a>
            </Button>

            <Button variant="outline" asChild>
              <a href="/trips/new">
                <Mail className="h-4 w-4 mr-2" />
                Create Trip & Test Email
              </a>
            </Button>
          </div>

          <Separator />

          <div className="text-sm text-gray-600">
            <h4 className="font-medium mb-2">What should happen:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>No more "API key is invalid" errors</li>
              <li>Email invitations send successfully</li>
              <li>Collaborators receive invitation emails</li>
              <li>Registration links work properly</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Common Issues */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>🔧 Still Having Issues?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Key still invalid after update?</strong>
              <p className="text-gray-600">Make sure you restarted your dev server and the key starts with "re_"</p>
            </div>

            <div>
              <strong>Can't send to other email addresses?</strong>
              <p className="text-gray-600">
                Resend's free tier only allows sending to your verified email. Verify a domain at{" "}
                <a
                  href="https://resend.com/domains"
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  resend.com/domains
                </a>
              </p>
            </div>

            <div>
              <strong>Environment variable not loading?</strong>
              <p className="text-gray-600">Check that .env.local is in your project root and restart the server</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
