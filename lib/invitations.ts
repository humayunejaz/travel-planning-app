import { supabase, isSupabaseAvailable } from "./supabase"
import { emailService } from "./email"

export interface TripInvitation {
  id: string
  trip_id: string
  email: string
  token: string
  invited_by: string
  status: "pending" | "accepted" | "declined"
  created_at: string
  expires_at: string
}

export const invitationsService = {
  generateInvitationToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  },

  async createInvitation(tripId: string, email: string, invitedBy: string): Promise<TripInvitation> {
    const token = this.generateInvitationToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

    const invitation: TripInvitation = {
      id: `inv-${Date.now()}`,
      trip_id: tripId,
      email: email,
      token: token,
      invited_by: invitedBy,
      status: "pending",
      created_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    }

    if (!isSupabaseAvailable() || !supabase) {
      // Store in localStorage for demo mode
      const invitations = JSON.parse(localStorage.getItem("invitations") || "[]")
      invitations.push(invitation)
      localStorage.setItem("invitations", JSON.stringify(invitations))
      return invitation
    }

    try {
      const { data, error } = await supabase.from("trip_invitations").insert(invitation).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error creating invitation:", error)
      // Fall back to localStorage
      const invitations = JSON.parse(localStorage.getItem("invitations") || "[]")
      invitations.push(invitation)
      localStorage.setItem("invitations", JSON.stringify(invitations))
      return invitation
    }
  },

  async getInvitationByToken(token: string): Promise<TripInvitation | null> {
    if (!isSupabaseAvailable() || !supabase) {
      // Check localStorage for demo mode
      const invitations = JSON.parse(localStorage.getItem("invitations") || "[]")
      const invitation = invitations.find((inv: TripInvitation) => inv.token === token)

      if (invitation && new Date(invitation.expires_at) > new Date()) {
        return invitation
      }
      return null
    }

    try {
      const { data, error } = await supabase
        .from("trip_invitations")
        .select("*")
        .eq("token", token)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .single()

      if (error) return null
      return data
    } catch (error) {
      console.error("Error fetching invitation:", error)
      return null
    }
  },

  async acceptInvitation(token: string): Promise<boolean> {
    if (!isSupabaseAvailable() || !supabase) {
      // Update localStorage for demo mode
      const invitations = JSON.parse(localStorage.getItem("invitations") || "[]")
      const invitationIndex = invitations.findIndex((inv: TripInvitation) => inv.token === token)

      if (invitationIndex >= 0) {
        invitations[invitationIndex].status = "accepted"
        localStorage.setItem("invitations", JSON.stringify(invitations))
        return true
      }
      return false
    }

    try {
      const { error } = await supabase.from("trip_invitations").update({ status: "accepted" }).eq("token", token)

      return !error
    } catch (error) {
      console.error("Error accepting invitation:", error)
      return false
    }
  },

  // Fixed function name and parameters to match the usage
  async sendInvitation(params: {
    tripId: string
    tripTitle: string
    inviterName: string
    inviterEmail: string
    inviteeEmail: string
  }): Promise<boolean> {
    console.log("=== SENDING INVITATION ===")
    console.log("Parameters:", params)

    try {
      // Use the correct function name that matches emailService
      const result = await this.sendInvitationEmail(
        params.tripId,
        params.tripTitle,
        params.inviteeEmail,
        params.inviterName,
        params.inviterEmail,
      )

      console.log("Invitation result:", result)
      return result
    } catch (error) {
      console.error("Error in sendInvitation:", error)
      return false
    }
  },

  async sendInvitationEmail(
    tripId: string,
    tripTitle: string,
    recipientEmail: string,
    inviterName: string,
    inviterEmail: string,
  ): Promise<boolean> {
    console.log("=== SENDING INVITATION EMAIL ===")
    console.log("Trip ID:", tripId)
    console.log("Trip Title:", tripTitle)
    console.log("Recipient:", recipientEmail)
    console.log("Inviter:", inviterName, inviterEmail)

    try {
      // Create the invitation record
      console.log("Creating invitation record...")
      const invitation = await this.createInvitation(tripId, recipientEmail, inviterEmail)
      console.log("Invitation created:", invitation)

      // Send the email
      console.log("Sending email via emailService...")
      const emailSent = await emailService.sendTripInvitation({
        recipientEmail,
        tripTitle,
        inviterName,
        inviterEmail,
        tripId,
        invitationToken: invitation.token,
      })

      console.log("Email service result:", emailSent)
      return emailSent
    } catch (error) {
      console.error("❌ Error in sendInvitationEmail:", error)
      return false
    }
  },
}
