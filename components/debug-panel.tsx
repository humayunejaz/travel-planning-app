"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, X } from "lucide-react"

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)

  const checkEnvironment = async () => {
    try {
      const response = await fetch("/api/debug-env")
      const data = await response.json()
      return data
    } catch (error) {
      return { error: "Failed to check environment" }
    }
  }

  const [envData, setEnvData] = useState<any>(null)

  const handleCheck = async () => {
    const data = await checkEnvironment()
    setEnvData(data)
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setIsOpen(true)
          handleCheck()
        }}
        className="fixed bottom-16 right-4 z-40"
      >
        <Settings className="h-4 w-4 mr-2" />
        Debug
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Environment Debug Panel</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Environment Variables Status</h3>
              {envData ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>RESEND_API_KEY:</span>
                    <Badge variant={envData.hasResendKey ? "default" : "destructive"}>
                      {envData.hasResendKey ? "✅ Configured" : "❌ Missing"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>NEXT_PUBLIC_APP_URL:</span>
                    <Badge variant={envData.hasAppUrl ? "default" : "secondary"}>
                      {envData.hasAppUrl ? "✅ Set" : "⚠️ Using default"}
                    </Badge>
                  </div>
                  {envData.hasResendKey && (
                    <div className="text-sm text-gray-600">API Key: {envData.resendKeyPreview}</div>
                  )}
                  {envData.hasAppUrl && <div className="text-sm text-gray-600">App URL: {envData.appUrl}</div>}
                </div>
              ) : (
                <div>Loading...</div>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/test-email", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          recipientEmail: "test@example.com",
                          tripTitle: "Debug Test Trip",
                          inviterName: "Debug User",
                          inviterEmail: "debug@example.com",
                          invitationToken: "debug-token-123",
                          tripId: "debug-trip-123",
                        }),
                      })
                      const result = await response.json()
                      alert(JSON.stringify(result, null, 2))
                    } catch (error) {
                      alert("Test failed: " + error)
                    }
                  }}
                >
                  Test Email API
                </Button>
                <Button variant="outline" size="sm" onClick={handleCheck}>
                  Refresh Status
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Setup Instructions</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>1. Get your Resend API key from resend.com</p>
                <p>2. Add it to your environment variables as RESEND_API_KEY</p>
                <p>3. Restart your development server</p>
                <p>4. The status above should show "✅ Configured"</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
