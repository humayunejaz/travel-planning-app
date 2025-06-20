"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Eye, EyeOff, Terminal } from "lucide-react"

interface DebugStep {
  name: string
  status: "pending" | "success" | "error" | "warning"
  message: string
  details?: any
  solution?: string
}

export default function DeepDebugResendPage() {
  const [debugSteps, setDebugSteps] = useState<DebugStep[]>([])
  const [isDebugging, setIsDebugging] = useState(false)
  const [testApiKey, setTestApiKey] = useState("")
  const [showTestKey, setShowTestKey] = useState(false)
  const [serverRestarted, setServerRestarted] = useState(false)

  const addStep = (step: DebugStep) => {
    setDebugSteps((prev) => [...prev, step])
  }

  const updateLastStep = (updates: Partial<DebugStep>) => {
    setDebugSteps((prev) => {
      const newSteps = [...prev]
      if (newSteps.length > 0) {
        newSteps[newSteps.length - 1] = { ...newSteps[newSteps.length - 1], ...updates }
      }
      return newSteps
    })
  }

  const clearSteps = () => {
    setDebugSteps([])
  }

  const runDeepDiagnostic = async () => {
    setIsDebugging(true)
    clearSteps()

    // Step 1: Check what the server actually sees
    addStep({
      name: "Server Environment Check",
      status: "pending",
      message: "Checking what environment variables the server can see...",
    })

    try {
      const envResponse = await fetch("/api/deep-debug-env")
      const envData = await envResponse.json()

      updateLastStep({
        status: envData.hasResendKey ? "success" : "error",
        message: envData.hasResendKey
          ? `✅ Server sees RESEND_API_KEY (${envData.keyInfo.length} chars, starts with: ${envData.keyInfo.preview})`
          : "❌ Server cannot see RESEND_API_KEY environment variable",
        details: envData,
        solution: !envData.hasResendKey ? "The server isn't loading your .env.local file properly" : undefined,
      })

      if (!envData.hasResendKey) {
        addStep({
          name: "Environment File Check",
          status: "error",
          message: "Your .env.local file is not being loaded by the server",
          solution:
            "1. Make sure .env.local is in project root\n2. Restart dev server completely\n3. Check file permissions",
        })
        setIsDebugging(false)
        return
      }

      // Step 2: Test the actual key the server is using
      addStep({
        name: "Server API Key Test",
        status: "pending",
        message: "Testing the exact API key the server is using...",
      })

      const serverKeyResponse = await fetch("/api/test-server-resend-key")
      const serverKeyData = await serverKeyResponse.json()

      updateLastStep({
        status: serverKeyData.valid ? "success" : "error",
        message: serverKeyData.valid
          ? "✅ Server's API key works perfectly"
          : `❌ Server's API key failed: ${serverKeyData.error}`,
        details: serverKeyData,
        solution: !serverKeyData.valid ? "The API key in your environment is still invalid" : undefined,
      })

      // Step 3: Compare with what you think you set
      if (testApiKey) {
        addStep({
          name: "Key Comparison",
          status: "pending",
          message: "Comparing server key with what you provided...",
        })

        const comparison = {
          serverKey: envData.keyInfo.preview + "...",
          yourKey: testApiKey.substring(0, 8) + "...",
          match: envData.keyInfo.full === testApiKey,
        }

        updateLastStep({
          status: comparison.match ? "success" : "warning",
          message: comparison.match
            ? "✅ Keys match - server is using your intended key"
            : `⚠️ Keys don't match!\nServer: ${comparison.serverKey}\nYour input: ${comparison.yourKey}`,
          details: comparison,
          solution: !comparison.match ? "Your .env.local file has a different key than expected" : undefined,
        })
      }

      // Step 4: Test actual email sending
      addStep({
        name: "Email Send Test",
        status: "pending",
        message: "Testing actual email sending with server's key...",
      })

      const emailResponse = await fetch("/api/test-real-email-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testEmail: "test@example.com" }),
      })
      const emailData = await emailResponse.json()

      updateLastStep({
        status: emailData.success ? "success" : "error",
        message: emailData.success
          ? "✅ Email sending works (would send if email was valid)"
          : `❌ Email sending failed: ${emailData.error}`,
        details: emailData,
        solution: !emailData.success ? "There's still an issue with your API key or Resend setup" : undefined,
      })
    } catch (error) {
      addStep({
        name: "Diagnostic Error",
        status: "error",
        message: `Failed to run diagnostics: ${error}`,
        solution: "Check browser console for more details",
      })
    }

    setIsDebugging(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "pending":
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Terminal className="h-8 w-8 text-red-600" />
          Deep Debug: Still Getting API Key Error
        </h1>
        <p className="text-gray-600">Let's find out exactly what's wrong with your setup</p>
      </div>

      {/* Current Status */}
      <Alert className="mb-6 border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Issue:</strong> You've updated your API key but still getting "API key is invalid" errors. This
          usually means the server isn't seeing your changes.
        </AlertDescription>
      </Alert>

      {/* Test Key Input */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🔑 What Key Did You Set?</CardTitle>
          <CardDescription>Enter the API key you think you added to .env.local</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-key">API Key from .env.local</Label>
            <div className="relative">
              <Input
                id="test-key"
                type={showTestKey ? "text" : "password"}
                placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={testApiKey}
                onChange={(e) => setTestApiKey(e.target.value)}
                className="pr-10"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowTestKey(!showTestKey)}
              >
                {showTestKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Server Restart Confirmation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🔄 Server Restart Confirmation</CardTitle>
          <CardDescription>Did you completely restart your development server?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="server-restart"
              checked={serverRestarted}
              onChange={(e) => setServerRestarted(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="server-restart">
              Yes, I stopped the server (Ctrl+C) and ran <code>npm run dev</code> again
            </Label>
          </div>

          {!serverRestarted && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Important:</strong> Environment variables are only loaded when the server starts. You MUST
                restart your dev server after changing .env.local
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Deep Diagnostic */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🔍 Run Deep Diagnostic</CardTitle>
          <CardDescription>This will check exactly what the server sees vs what you expect</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runDeepDiagnostic} disabled={isDebugging} className="flex items-center gap-2">
            {isDebugging ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Terminal className="h-4 w-4" />}
            {isDebugging ? "Running Deep Diagnostic..." : "Run Deep Diagnostic"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {debugSteps.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>📊 Diagnostic Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {debugSteps.map((step, index) => (
                <div key={index}>
                  <Alert
                    className={
                      step.status === "success"
                        ? "border-green-200 bg-green-50"
                        : step.status === "error"
                          ? "border-red-200 bg-red-50"
                          : step.status === "warning"
                            ? "border-yellow-200 bg-yellow-50"
                            : "border-blue-200 bg-blue-50"
                    }
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(step.status)}
                      <div className="flex-1">
                        <div className="font-medium">{step.name}</div>
                        <AlertDescription className="mt-1 whitespace-pre-line">{step.message}</AlertDescription>
                        {step.solution && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                            <strong>Solution:</strong> {step.solution}
                          </div>
                        )}
                        {step.details && (
                          <details className="mt-2">
                            <summary className="text-sm cursor-pointer text-gray-600">View Technical Details</summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                              {JSON.stringify(step.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </Alert>
                  {index < debugSteps.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Fixes */}
      <Card>
        <CardHeader>
          <CardTitle>🛠️ Manual Troubleshooting</CardTitle>
          <CardDescription>Try these if the diagnostic doesn't solve it</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">1. Check .env.local File Location</h4>
              <p className="text-sm text-gray-600 mb-2">
                Make sure it's in the project root (same level as package.json)
              </p>
              <div className="bg-gray-900 text-green-400 p-2 rounded font-mono text-xs">
                your-project/
                <br />
                ├── .env.local ← Should be here
                <br />
                ├── package.json
                <br />
                ├── next.config.mjs
                <br />
                └── app/
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">2. Check File Contents</h4>
              <p className="text-sm text-gray-600 mb-2">Open .env.local and verify it contains:</p>
              <div className="bg-gray-900 text-green-400 p-2 rounded font-mono text-xs">
                RESEND_API_KEY=re_your_actual_key_here
              </div>
              <p className="text-xs text-gray-500 mt-1">No spaces around the = sign, no quotes needed</p>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">3. Complete Server Restart</h4>
              <p className="text-sm text-gray-600 mb-2">In your terminal:</p>
              <div className="bg-gray-900 text-green-400 p-2 rounded font-mono text-xs">
                # Stop server (Ctrl+C or Cmd+C)
                <br /># Then restart:
                <br />
                npm run dev
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">4. Try .env Instead of .env.local</h4>
              <p className="text-sm text-gray-600 mb-2">Some setups prefer .env:</p>
              <div className="bg-gray-900 text-green-400 p-2 rounded font-mono text-xs">
                # Create .env file with:
                <br />
                RESEND_API_KEY=re_your_actual_key_here
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
