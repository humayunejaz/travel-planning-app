import { isSupabaseAvailable } from "./supabase"

export interface InvitationEmailData {
  recipientEmail: string
  recipientName?: string
  tripTitle: string
  inviterName: string
  inviterEmail: string
  tripId: string
  invitationToken: string
}

export const emailService = {
  async sendTripInvitation(data: InvitationEmailData): Promise<boolean> {
    console.log("Sending trip invitation email:", data)

    if (!isSupabaseAvailable()) {
      // In demo mode, just log the invitation
      console.log("Demo mode: Would send email invitation to", data.recipientEmail)
      console.log("Invitation link:", this.generateInvitationLink(data.invitationToken, data.tripId))

      // Show a mock notification
      if (typeof window !== "undefined") {
        alert(
          `Demo: Invitation email would be sent to ${data.recipientEmail}\n\nInvitation link: ${this.generateInvitationLink(data.invitationToken, data.tripId)}`,
        )
      }

      return true
    }

    try {
      // In a real implementation, you would use a service like:
      // - Supabase Edge Functions
      // - Resend
      // - SendGrid
      // - Nodemailer with SMTP

      // For now, we'll simulate sending an email
      const emailContent = this.generateEmailContent(data)

      console.log("Email content generated:", emailContent)

      // Here you would integrate with your email service
      // Example with a hypothetical email API:
      /*
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.recipientEmail,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        })
      })
      
      return response.ok
      */

      // For demo purposes, show the email content
      if (typeof window !== "undefined") {
        const shouldShow = confirm(
          `Demo: Send invitation email to ${data.recipientEmail}?\n\nClick OK to see the email content.`,
        )
        if (shouldShow) {
          const newWindow = window.open("", "_blank")
          if (newWindow) {
            newWindow.document.write(`
              <html>
                <head><title>Email Preview</title></head>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  ${emailContent.html}
                </body>
              </html>
            `)
          }
        }
      }

      return true
    } catch (error) {
      console.error("Error sending invitation email:", error)
      return false
    }
  },

  generateInvitationLink(token: string, tripId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    return `${baseUrl}/register?invitation=${token}&trip=${tripId}`
  },

  generateEmailContent(data: InvitationEmailData) {
    const invitationLink = this.generateInvitationLink(data.invitationToken, data.tripId)

    const subject = `You're invited to join "${data.tripTitle}" trip!`

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">✈️ Trip Invitation</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1f2937; margin-top: 0;">You're invited to join a trip!</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            <strong>${data.inviterName}</strong> (${data.inviterEmail}) has invited you to collaborate on their trip:
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 20px;">${data.tripTitle}</h3>
            <p style="color: #6b7280; margin: 0;">Plan together, explore together!</p>
          </div>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Join TravelPlan to help plan destinations, manage itineraries, and make this trip unforgettable.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationLink}" 
               style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Accept Invitation & Join Trip
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${invitationLink}" style="color: #3b82f6; word-break: break-all;">${invitationLink}</a>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This invitation was sent by TravelPlan. If you didn't expect this email, you can safely ignore it.
            </p>
          </div>
        </div>
      </div>
    `

    const text = `
You're invited to join "${data.tripTitle}"!

${data.inviterName} (${data.inviterEmail}) has invited you to collaborate on their trip.

Join TravelPlan to help plan destinations, manage itineraries, and make this trip unforgettable.

Accept your invitation by visiting: ${invitationLink}

If you didn't expect this email, you can safely ignore it.
    `.trim()

    return { subject, html, text }
  },
}
