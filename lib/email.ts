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
    console.log("=== EMAIL SERVICE DEBUG ===")
    console.log("Attempting to send email to:", data.recipientEmail)
    console.log("Trip:", data.tripTitle)
    console.log("Environment check...")

    try {
      // Call our API route to send the email
      const response = await fetch("/api/send-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientEmail: data.recipientEmail,
          tripTitle: data.tripTitle,
          inviterName: data.inviterName,
          inviterEmail: data.inviterEmail,
          invitationToken: data.invitationToken,
          tripId: data.tripId,
        }),
      })

      console.log("API Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ Email API error:", errorData)

        // Show error message instead of demo popup
        if (typeof window !== "undefined") {
          this.showEmailErrorNotification(data, errorData.error || "Failed to send email")
        }
        return false
      }

      const result = await response.json()
      console.log("✅ Email sent successfully via Resend:", result)

      // Store the sent email for tracking
      this.recordSentEmail(data, "sent")

      // Show success notification
      if (typeof window !== "undefined") {
        this.showEmailSuccessNotification(data)
      }

      return true
    } catch (error) {
      console.error("❌ Error sending invitation email:", error)

      // Show error instead of falling back to demo
      if (typeof window !== "undefined") {
        this.showEmailErrorNotification(data, "Network error - please check your connection")
      }
      return false
    }
  },

  recordSentEmail(data: InvitationEmailData, status: "sent" | "demo" | "failed") {
    const sentEmails = JSON.parse(localStorage.getItem("sentEmails") || "[]")
    const emailRecord = {
      id: Date.now(),
      to: data.recipientEmail,
      subject: `You're invited to join "${data.tripTitle}" trip!`,
      invitationLink: this.generateInvitationLink(data.invitationToken, data.tripId),
      sentAt: new Date().toISOString(),
      tripTitle: data.tripTitle,
      inviterName: data.inviterName,
      status: status,
    }

    sentEmails.push(emailRecord)
    localStorage.setItem("sentEmails", JSON.stringify(sentEmails))
  },

  showEmailSuccessNotification(data: InvitationEmailData) {
    // Create a simple success notification for real emails
    const notification = document.createElement("div")
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 400px;
    `

    notification.innerHTML = `
      <div style="display: flex; align-items: center;">
        <div style="font-size: 20px; margin-right: 12px;">✅</div>
        <div>
          <div style="font-weight: 600; margin-bottom: 4px;">Email Sent!</div>
          <div style="font-size: 14px; opacity: 0.9;">Invitation sent to ${data.recipientEmail}</div>
        </div>
      </div>
    `

    document.body.appendChild(notification)

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove()
      }
    }, 5000)
  },

  showEmailErrorNotification(data: InvitationEmailData, errorMessage: string) {
    // Create an error notification
    const notification = document.createElement("div")
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 400px;
    `

    notification.innerHTML = `
      <div style="display: flex; align-items: center;">
        <div style="font-size: 20px; margin-right: 12px;">❌</div>
        <div>
          <div style="font-weight: 600; margin-bottom: 4px;">Email Failed</div>
          <div style="font-size: 14px; opacity: 0.9;">${errorMessage}</div>
          <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">Check your Resend API key configuration</div>
        </div>
      </div>
    `

    document.body.appendChild(notification)

    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove()
      }
    }, 8000)
  },

  generateInvitationLink(token: string, tripId: string): string {
    // Updated to go directly to register page with invitation context
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
    return `${baseUrl}/register?invitation=${token}&trip=${tripId}`
  },

  // Method to view all "sent" emails (for demo purposes)
  getSentEmails() {
    return JSON.parse(localStorage.getItem("sentEmails") || "[]")
  },

  // Method to clear email history
  clearEmailHistory() {
    localStorage.removeItem("sentEmails")
  },
}
