"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { isSupabaseAvailable } from "@/lib/supabase"

export function DebugEnvPanel() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isAvailable = isSupabaseAvailable()

  const checkEnvVar = (name: string, value: string | undefined) => {
    if (!value) {
      return { status: "missing", message: "Not set" }
    }
    if (value.includes("your_") || value.includes("placeholder")) {
      return { status: "placeholder", message: "Contains placeholder text" }
    }
    return { status: "ok", message: "Set correctly" }
  }

  const urlCheck = checkEnvVar("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl)
  const keyCheck = checkEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY", supabaseKey)

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Environment Variables Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className={isAvailable ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
          <div className="flex items-center gap-2">
            {isAvailable ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={isAvailable ? "text-green-800" : "text-red-800"}>
              <strong>Supabase Status:</strong> {isAvailable ? "Available" : "Not Available"}
            </AlertDescription>
          </div>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <strong>NEXT_PUBLIC_SUPABASE_URL</strong>
              <div className="text-sm text-gray-600">
                {supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "Not set"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {urlCheck.status === "ok" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">{urlCheck.message}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong>
              <div className="text-sm text-gray-600">
                {supabaseKey ? `${supabaseKey.substring(0, 30)}...` : "Not set"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {keyCheck.status === "ok" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">{keyCheck.message}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h4 className="font-semibold mb-2">Troubleshooting Steps:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>
              Check that <code>.env.local</code> is in your project root
            </li>
            <li>Verify no spaces around the = sign</li>
            <li>
              Restart your dev server: <code>npm run dev</code>
            </li>
            <li>Clear browser cache and reload</li>
            <li>Check for typos in variable names</li>
          </ol>
        </div>

        <Button onClick={() => window.location.reload()} className="w-full">
          Reload Page
        </Button>
      </CardContent>
    </Card>
  )
}
