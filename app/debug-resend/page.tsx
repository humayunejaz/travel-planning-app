"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, AlertCircle, XCircle, Eye, EyeOff, Copy, RefreshCw, Mail, Key, Server } from "lucide-react"

interface DebugResult {
  step: string
  status: "success" | "error" | "warning"
  message: string
  details?: any
}

export default function DebugResendPage() {
  const [debugResults, setDebugResults] = useState<DebugResult[]>([])
  const [isDebugging, setIsDebugging] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [manualApiKey, setManualApiKey] = useState("")

  const addResult = (result: DebugResult) => {
    setDebugResults((prev) => [...prev, result])
  }

  const clearResults = () => {
    setDebugResults([])
  }

  const runFullDiagnostic = async () => {
    setIsDebugging(true)
    clearResults()

    // Step 1: Check environment variables
    addResult({
      step: "Environment Check",
      status: "success",
      message: "Checking environment variables...",
    })

    try {
      const envResponse = await fetch("/api/debug-resend-env")
      const envData = await envResponse.json()

      addResult({
        step: "Environment Variables",
        status: envData.hasApiKey ? "success" : "error",
        message: envData.hasApiKey
          ? `✅ RESEND_API_KEY found (${envData.keyLength} characters)`
          : "❌ RESEND_API_KEY not found in environment",
        details: envData,
      })

      if (!envData.hasApiKey) {
        addResult({
          step: "Solution",
          status: "warning",
          message: "Add RESEND_API_KEY to your .env.local file and restart the server",
        })
        setIsDebugging(false)
        return
      }

      // Step 2: Validate API key format
      if (envData.keyPreview) {
        const isValidFormat = envData.keyPreview.startsWith("re_")
        addResult({
          step: "API Key Format",
          status: isValidFormat ? "success" : "error",
          message: isValidFormat
            ? `✅ API key format looks correct (${envData.keyPreview}...)`
            : `❌ API key format invalid. Should start with 're_' but found: ${envData.keyPreview}...`,
        })

        if (!isValidFormat) {
          addResult({
            step: "Solution",
            status: "warning",
            message: "Get a valid API key from https://resend.com/api-keys",
          })
        }
      }

      // Step 3: Test API key with Resend
      addResult({
        step: "API Key Validation",
        status: "success",
        message: "Testing API key with Resend...",
      })

      const testResponse = await fetch("/api/test-resend-key")
      const testData = await testResponse.json()

      addResult({
        step: "Resend API Test",
        status: testData.valid ? "success" : "error",
        message: testData.valid ? "✅ API key is valid and working" : `❌ API key validation failed: ${testData.error}`,
        details: testData,
      })

      if (!testData.valid) {
        if (testData.error?.includes("Invalid API key")) {
          addResult({
            step: "Solution",
            status: "warning",
            message: "Your API key is invalid. Generate a new one at https://resend.com/api-keys",
          })
        } else if (testData.error?.includes("testing emails")) {
          addResult({
            step: "Domain Limitation",
            status: "warning",
            message:
              "API key works but you can only send to verified email addresses. Verify a domain at https://resend.com/domains",
          })
        }
      }
    } catch (error) {
      addResult({
        step: "Diagnostic Error",
        status: "error",
        message: `Failed to run diagnostics: ${error}`,
      })
    }

    setIsDebugging(false)
  }

  const testEmailSending = async () => {
    if (!testEmail) {
      alert("Please enter an email address to test")
      return
    }

    addResult({
      step: "Email Test",
      status: "success",
      message: `Testing email send to ${testEmail}...`,
    })

    try {
      const response = await fetch("/api/send-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientEmail: testEmail,
          tripTitle: "Debug Test Trip",
          inviterName: "Debug Test",
          inviterEmail: "debug@test.com",
          invitationToken: "debug-token-" + Date.now(),
          tripId: "debug-trip-id",
        }),
      })

      const result = await response.json()

      addResult({
        step: "Email Send Result",
        status: response.ok ? "success" : "error",
        message: response.ok ? `✅ Email sent successfully to ${testEmail}` : `❌ Email failed: ${result.error}`,
        details: result,
      })
    } catch (error) {
      addResult({
        step: "Email Send Error",
        status: "error",
        message: `Network error: ${error}`,
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Key className="h-8 w-8 text-blue-600" />
          Resend API Debug Tool
        </h1>
        <p className="text-gray-600">Diagnose and fix Resend API key issues</p>
      </div>

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🔧 Quick Diagnostic</CardTitle>
          <CardDescription>Run a complete check of your Resend setup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button onClick={runFullDiagnostic} disabled={isDebugging} className="flex items-center gap-2">
              {isDebugging ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Server className="h-4 w-4" />}
              {isDebugging ? "Running Diagnostics..." : "Run Full Diagnostic"}
            </Button>

            <Button variant="outline" onClick={clearResults}>
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manual API Key Test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🧪 Manual API Key Test</CardTitle>
          <CardDescription>Test a specific API key without changing environment variables</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="manual-key">API Key to Test</Label>
            <div className="relative">
              <Input
                id="manual-key"
                type={showApiKey ? "text" : "password"}
                placeholder="re_your_api_key_here"
                value={manualApiKey}
                onChange={(e) => setManualApiKey(e.target.value)}
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
            variant="outline"
            disabled={!manualApiKey}
            onClick={async () => {
              addResult({
                step: "Manual Key Test",
                status: "success",
                message: "Testing provided API key...",
              })

              try {
                const response = await fetch("/api/test-resend-key", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ apiKey: manualApiKey }),
                })
                const result = await response.json()

                addResult({
                  step: "Manual Key Result",
                  status: result.valid ? "success" : "error",
                  message: result.valid
                    ? "✅ Provided API key is valid"
                    : `❌ Provided API key failed: ${result.error}`,
                  details: result,
                })
              } catch (error) {
                addResult({
                  step: "Manual Key Error",
                  status: "error",
                  message: `Error testing key: ${error}`,
                })
              }
            }}
          >
            Test This Key
          </Button>
        </CardContent>
      </Card>

      {/* Email Test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>📧 Email Send Test</CardTitle>
          <CardDescription>Test sending an actual email invitation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">Email Address</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="your-email@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>

          <Button onClick={testEmailSending} disabled={!testEmail} className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Send Test Email
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {debugResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Diagnostic Results</CardTitle>
            <CardDescription>Step-by-step analysis of your Resend setup</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {debugResults.map((result, index) => (
                <div key={index}>
                  <Alert
                    className={
                      result.status === "success"
                        ? "border-green-200 bg-green-50"
                        : result.status === "error"
                          ? "border-red-200 bg-red-50"
                          : "border-yellow-200 bg-yellow-50"
                    }
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="font-medium">{result.step}</div>
                        <AlertDescription className="mt-1">{result.message}</AlertDescription>
                        {result.details && (
                          <details className="mt-2">
                            <summary className="text-sm cursor-pointer text-gray-600">View Details</summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </Alert>
                  {index < debugResults.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>📋 Setup Checklist</CardTitle>
          <CardDescription>Common solutions for Resend API issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-1">
                <span className="text-blue-800 text-sm font-bold">1</span>
              </div>
              <div>
                <p className="font-medium">Get Valid API Key</p>
                <p className="text-sm text-gray-600">
                  Visit{" "}
                  <a
                    href="https://resend.com/api-keys"
                    target="_blank"
                    className="text-blue-600 underline"
                    rel="noreferrer"
                  >
                    resend.com/api-keys
                  </a>{" "}
                  and create a new API key
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-1">
                <span className="text-blue-800 text-sm font-bold">2</span>
              </div>
              <div>
                <p className="font-medium">Add to Environment</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    Add to your <code>.env.local</code> file:
                  </p>
                  <div className="bg-gray-900 text-green-400 p-2 rounded font-mono text-xs">
                    RESEND_API_KEY=re_your_actual_key_here
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard("RESEND_API_KEY=re_your_actual_key_here")}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-1">
                <span className="text-blue-800 text-sm font-bold">3</span>
              </div>
              <div>
                <p className="font-medium">Restart Server</p>
                <p className="text-sm text-gray-600">
                  Stop your dev server and run <code>npm run dev</code> again
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-yellow-100 rounded-full p-1">
                <span className="text-yellow-800 text-sm font-bold">!</span>
              </div>
              <div>
                <p className="font-medium">Domain Verification (Production)</p>
                <p className="text-sm text-gray-600">
                  For production use, verify your domain at{" "}
                  <a
                    href="https://resend.com/domains"
                    target="_blank"
                    className="text-blue-600 underline"
                    rel="noreferrer"
                  >
                    resend.com/domains
                  </a>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
