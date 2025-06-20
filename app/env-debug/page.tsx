"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertTriangle, Copy } from "lucide-react"
import { useState } from "react"

export default function EnvDebugPage() {
  const [copied, setCopied] = useState(false)

  // Check all possible environment variable sources
  const clientSideUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const clientSideKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check if running in browser
  const isBrowser = typeof window !== "undefined"

  // Get all environment variables that start with NEXT_PUBLIC
  const allEnvVars = isBrowser ? {} : process.env
  const nextPublicVars = Object.keys(allEnvVars || {})
    .filter((key) => key.startsWith("NEXT_PUBLIC"))
    .reduce(
      (obj, key) => {
        obj[key] = allEnvVars[key]
        return obj
      },
      {} as Record<string, string>,
    )

  const copyEnvTemplate = () => {
    const template = `NEXT_PUBLIC_SUPABASE_URL=https://lidnnsxbakqyqllvdfwo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpZG5uc3hiYWtxeXFsbHZkZndvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODA2NjcsImV4cCI6MjA2NDY1NjY2N30.XObEosbnyb51tWgz6ENyMPY2HQ6feqiTsX7Ti5lOAjo`

    navigator.clipboard.writeText(template)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Status */}
            <div className="space-y-3">
              <h3 className="font-semibold">Current Status</h3>

              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <strong>NEXT_PUBLIC_SUPABASE_URL</strong>
                  <div className="text-sm text-gray-600 font-mono">{clientSideUrl || "❌ Not found"}</div>
                </div>
                {clientSideUrl ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong>
                  <div className="text-sm text-gray-600 font-mono">
                    {clientSideKey ? `${clientSideKey.substring(0, 20)}...` : "❌ Not found"}
                  </div>
                </div>
                {clientSideKey ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
            </div>

            {/* All NEXT_PUBLIC vars */}
            <div className="space-y-3">
              <h3 className="font-semibold">All NEXT_PUBLIC Environment Variables</h3>
              <div className="bg-gray-100 p-4 rounded font-mono text-sm">
                {Object.keys(nextPublicVars).length > 0 ? (
                  <pre>{JSON.stringify(nextPublicVars, null, 2)}</pre>
                ) : (
                  <div className="text-red-600">No NEXT_PUBLIC environment variables found</div>
                )}
              </div>
            </div>

            {/* Troubleshooting Steps */}
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                <div className="space-y-4">
                  <strong>Troubleshooting Steps:</strong>

                  <div className="space-y-3">
                    <div>
                      <strong>1. Copy the correct .env.local content:</strong>
                      <div className="mt-2">
                        <Button onClick={copyEnvTemplate} variant="outline" size="sm" className="mb-2">
                          <Copy className="h-4 w-4 mr-2" />
                          {copied ? "Copied!" : "Copy .env.local content"}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <strong>2. Create/update .env.local file:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
                        <li>File must be in your project ROOT directory (same level as package.json)</li>
                        <li>
                          File name must be exactly: <code className="bg-gray-200 px-1 rounded">.env.local</code>
                        </li>
                        <li>No spaces around the = sign</li>
                        <li>No quotes around the values</li>
                      </ul>
                    </div>

                    <div>
                      <strong>3. Restart your development server:</strong>
                      <pre className="bg-gray-100 p-2 rounded text-xs mt-1">
                        # Stop the server (Ctrl+C or Cmd+C) # Then restart: npm run dev
                      </pre>
                    </div>

                    <div>
                      <strong>4. Check file location:</strong>
                      <div className="text-sm mt-1">
                        Your project structure should look like:
                        <pre className="bg-gray-100 p-2 rounded text-xs mt-1">
                          {`your-project/
├── .env.local          ← File should be here
├── package.json
├── next.config.mjs
├── app/
└── components/`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <Button onClick={() => window.location.reload()} className="w-full">
              Reload Page After Making Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
