"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, X, ExternalLink } from "lucide-react"

export function ResendSetupBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasResendKey, setHasResendKey] = useState(false)

  useEffect(() => {
    // Check if Resend is configured
    const checkResend = async () => {
      try {
        const response = await fetch("/api/debug-env")
        const data = await response.json()
        setHasResendKey(data.hasResendKey)

        // Show banner if no Resend key and user hasn't dismissed it
        if (!data.hasResendKey && !localStorage.getItem("resend-banner-dismissed")) {
          setIsVisible(true)
        }
      } catch (error) {
        console.error("Error checking Resend status:", error)
      }
    }

    checkResend()
  }, [])

  const dismissBanner = () => {
    setIsVisible(false)
    localStorage.setItem("resend-banner-dismissed", "true")
  }

  if (!isVisible || hasResendKey) {
    return null
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-orange-900">Email Service Not Configured</h3>
              <p className="text-sm text-orange-800 mt-1">
                To send real invitation emails, you need to set up Resend. Currently showing demo popups instead of
                sending emails.
              </p>
              <div className="mt-3 flex space-x-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open("https://resend.com", "_blank")}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Get Resend API Key
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open("/EMAIL_SETUP.md", "_blank")}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  Setup Guide
                </Button>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={dismissBanner}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
