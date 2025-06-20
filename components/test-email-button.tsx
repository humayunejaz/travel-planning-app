"use client"

import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { emailService } from "@/lib/email"
import { invitationsService } from "@/lib/invitations"

export function TestEmailButton() {
  const testEmail = async () => {
    console.log("Testing email notification...")

    const testData = {
      recipientEmail: "test@example.com",
      tripTitle: "Test Trip to Paris",
      inviterName: "Demo User",
      inviterEmail: "demo@example.com",
      tripId: "test-trip-123",
      invitationToken: invitationsService.generateInvitationToken(),
    }

    try {
      const result = await emailService.sendTripInvitation(testData)
      console.log("Test email result:", result)
    } catch (error) {
      console.error("Test email error:", error)
    }
  }

  return (
    <Button variant="outline" onClick={testEmail} className="fixed bottom-20 right-4 z-40">
      <Mail className="h-4 w-4 mr-2" />
      Test Email
    </Button>
  )
}
