"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, ExternalLink, Copy, Trash2, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { emailService } from "@/lib/email"

interface SentEmail {
  id: number
  to: string
  subject: string
  invitationLink: string
  sentAt: string
  tripTitle: string
  inviterName: string
  status: "sent" | "demo" | "failed"
}

export function EmailDashboard() {
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadSentEmails()
    }
  }, [isOpen])

  const loadSentEmails = () => {
    const emails = emailService.getSentEmails()
    setSentEmails(emails.reverse()) // Show newest first
  }

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      alert("Invitation link copied to clipboard!")
    } catch (error) {
      console.error("Failed to copy:", error)
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = link
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      alert("Invitation link copied to clipboard!")
    }
  }

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear all email history?")) {
      emailService.clearEmailHistory()
      setSentEmails([])
    }
  }

  const testInvitation = (link: string) => {
    window.open(link, "_blank")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "demo":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Mail className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800"
      case "demo":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "sent":
        return "Email Sent"
      case "demo":
        return "Demo Mode"
      case "failed":
        return "Failed"
      default:
        return status
    }
  }

  if (!isOpen) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="fixed bottom-4 right-4 z-50">
        <Mail className="h-4 w-4 mr-2" />
        View Sent Emails ({emailService.getSentEmails().length})
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Email Dashboard
            </CardTitle>
            <CardDescription>
              Track invitation emails sent via Resend and demo mode
              {process.env.RESEND_API_KEY ? " (Resend configured)" : " (Demo mode only)"}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {sentEmails.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearHistory}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[60vh]">
          {sentEmails.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No emails sent yet</h3>
              <p className="text-gray-600">Create a trip and add collaborators to see invitation emails here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sentEmails.map((email) => (
                <Card key={email.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{email.subject}</h4>
                        <p className="text-sm text-gray-600">To: {email.to}</p>
                        <p className="text-xs text-gray-500">Sent: {new Date(email.sentAt).toLocaleString()}</p>
                      </div>
                      <Badge variant="secondary" className={getStatusColor(email.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(email.status)}
                          {getStatusText(email.status)}
                        </div>
                      </Badge>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm">
                        <strong>Trip:</strong> {email.tripTitle}
                      </p>
                      <p className="text-sm">
                        <strong>Invited by:</strong> {email.inviterName}
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <p className="text-xs font-medium text-blue-900 mb-2">Invitation Link:</p>
                      <div className="bg-white border border-blue-200 rounded p-2 text-xs font-mono break-all text-blue-800">
                        {email.invitationLink}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => copyLink(email.invitationLink)}>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Link
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => testInvitation(email.invitationLink)}>
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Test Invitation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
