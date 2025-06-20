"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export default function CheckEnvPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const reloadPage = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables Check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <strong>NEXT_PUBLIC_SUPABASE_URL</strong>
                  <div className="text-sm text-gray-600">{supabaseUrl || "❌ Not found"}</div>
                </div>
                <div className="flex items-center gap-2">
                  {supabaseUrl ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong>
                  <div className="text-sm text-gray-600">
                    {supabaseKey ? `${supabaseKey.substring(0, 20)}...` : "❌ Not found"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {supabaseKey ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
            </div>

            {(!supabaseUrl || !supabaseKey) && (
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Environment variables are missing!</strong> Follow the steps below to fix this.
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-semibold mb-2">Fix Steps:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  <strong>Check your .env.local file</strong> in the project root
                </li>
                <li>
                  Make sure it contains:
                  <pre className="mt-1 bg-gray-100 p-2 rounded text-xs">
                    {`NEXT_PUBLIC_SUPABASE_URL=https://lidnnsxbakqyqllvdfwo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpZG5uc3hiYWtxeXFsbHZkZndvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODA2NjcsImV4cCI6MjA2NDY1NjY2N30.XObEosbnyb51tWgz6ENyMPY2HQ6feqiTsX7Ti5lOAjo`}
                  </pre>
                </li>
                <li>
                  <strong>Restart your development server:</strong>
                  <pre className="mt-1 bg-gray-100 p-2 rounded text-xs">npm run dev</pre>
                </li>
                <li>
                  <strong>Reload this page</strong> to check if it worked
                </li>
              </ol>
            </div>

            <Button onClick={reloadPage} className="w-full">
              Reload Page to Check Again
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
