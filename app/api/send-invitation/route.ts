import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(request: NextRequest) {
  console.log("=== SEND INVITATION API ===")

  try {
    // Check if Resend API key is configured
    const apiKey = process.env.RESEND_API_KEY
    console.log("API Key check:", {
      exists: !!apiKey,
      preview: apiKey ? `${apiKey.substring(0, 8)}...` : "Not set",
      length: apiKey?.length || 0,
    })

    if (!apiKey || apiKey === "" || apiKey === "undefined") {
      console.error("❌ RESEND_API_KEY not configured properly")
      return NextResponse.json(
        {
          error: "Email service not configured. Please add your Resend API key to environment variables.",
          code: "NO_API_KEY",
        },
        { status: 500 },
      )
    }

    // Initialize Resend
    console.log("✅ Initializing Resend with API key...")
    const resend = new Resend(apiKey)

    const body = await request.json()
    const { recipientEmail, tripTitle, inviterName, inviterEmail, invitationToken, tripId } = body

    console.log("Email data:", {
      to: recipientEmail,
      tripTitle,
      inviterName,
      hasToken: !!invitationToken,
    })

    // Validate required fields
    if (!recipientEmail || !tripTitle || !inviterName || !invitationToken) {
      console.error("❌ Missing required fields")
      return NextResponse.json(
        {
          error: "Missing required fields",
          code: "MISSING_FIELDS",
        },
        { status: 400 },
      )
    }

    // Generate the invitation link - now goes directly to register page
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin") || "http://localhost:3000"
    const invitationLink = `${baseUrl}/register?invitation=${invitationToken}&trip=${tripId}`

    console.log("🔗 Generated invitation link:", invitationLink)

    console.log("Sending email via Resend...")

    // 🚨 IMPORTANT: Change this line after domain verification!
    // For testing (current): from: "TravelPlan <onboarding@resend.dev>"
    // For production: from: "TravelPlan <noreply@yourdomain.com>"
    const fromAddress = "TravelPlan <onboarding@resend.dev>" // 👈 UPDATE THIS AFTER DOMAIN VERIFICATION

    console.log("From:", fromAddress)
    console.log("To:", recipientEmail)
    console.log("Subject: You're invited to join \"" + tripTitle + '" trip!')

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [recipientEmail],
      subject: `You're invited to join "${tripTitle}" trip!`,
      html: generateEmailHTML({
        recipientEmail,
        tripTitle,
        inviterName,
        inviterEmail,
        invitationLink,
      }),
      text: generateEmailText({
        recipientEmail,
        tripTitle,
        inviterName,
        inviterEmail,
        invitationLink,
      }),
    })

    if (error) {
      console.error("❌ Resend API error:", error)

      // Check for testing mode limitation
      if (error.message && error.message.includes("You can only send testing emails")) {
        return NextResponse.json(
          {
            error: "Resend is in testing mode. You can only send emails to your verified email address.",
            code: "RESEND_TESTING_MODE",
            details: error,
            solution: "To send emails to other recipients, verify a domain at resend.com/domains",
          },
          { status: 400 },
        )
      }

      return NextResponse.json(
        {
          error: `Resend API error: ${error.message || "Unknown error"}`,
          code: "RESEND_ERROR",
          details: error,
        },
        { status: 500 },
      )
    }

    console.log("✅ Email sent successfully!")
    console.log("Email ID:", data?.id)

    return NextResponse.json({
      success: true,
      data,
      invitationLink,
      message: `Email sent successfully to ${recipientEmail}`,
    })
  } catch (error: any) {
    console.error("❌ Unexpected error in email API:", error)
    return NextResponse.json(
      {
        error: `Server error: ${error.message || "Unknown error"}`,
        code: "SERVER_ERROR",
      },
      { status: 500 },
    )
  }
}

function generateEmailHTML(data: {
  recipientEmail: string
  tripTitle: string
  inviterName: string
  inviterEmail: string
  invitationLink: string
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Trip Invitation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">✈️ TravelPlan Invitation</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1f2937; margin-top: 0;">You're invited to join a trip!</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            <strong>${data.inviterName}</strong> has invited you to collaborate on their trip planning:
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px;">${data.tripTitle}</h3>
            <p style="color: #6b7280; margin: 0; font-size: 16px;">Plan together, explore together!</p>
          </div>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Join TravelPlan to help plan destinations, manage itineraries, and make this trip unforgettable. Click the button below to <strong>create your account</strong> and join the trip.
          </p>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.invitationLink}" 
               style="background: #3b82f6; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
              🎯 Create Account & Join Trip
            </a>
          </div>
          
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">
              <strong>What happens next?</strong>
            </p>
            <ul style="color: #6b7280; font-size: 14px; margin: 0; padding-left: 20px;">
              <li>Click the button above to go to the registration page</li>
              <li>Create your TravelPlan account (it's free!)</li>
              <li>You'll be automatically added to "${data.tripTitle}"</li>
              <li>Start collaborating on the travel plans immediately</li>
            </ul>
          </div>
          
          <!-- Alternative Link -->
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="color: #1e40af; font-size: 14px; margin: 0 0 8px 0;">
              <strong>🔗 Direct Registration Link (if button doesn't work):</strong>
            </p>
            <p style="margin: 0;">
              <a href="${data.invitationLink}" style="color: #2563eb; word-break: break-all; font-size: 14px; text-decoration: underline;">
                ${data.invitationLink}
              </a>
            </p>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="color: #92400e; font-size: 14px; margin: 0;">
              <strong>💡 New to TravelPlan?</strong> No worries! The registration is quick and easy. You'll be planning your trip in minutes.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                This invitation was sent by TravelPlan. If you didn't expect this email, you can safely ignore it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateEmailText(data: {
  recipientEmail: string
  tripTitle: string
  inviterName: string
  inviterEmail: string
  invitationLink: string
}) {
  return `
🎯 You're invited to join "${data.tripTitle}"!

${data.inviterName} has invited you to collaborate on their trip planning.

Join TravelPlan to help plan destinations, manage itineraries, and make this trip unforgettable.

👉 Create your account and join the trip: ${data.invitationLink}

What happens next?
✅ Click the link above to go to the registration page
✅ Create your TravelPlan account (it's free!)
✅ You'll be automatically added to "${data.tripTitle}"
✅ Start collaborating on the travel plans immediately

New to TravelPlan? No worries! The registration is quick and easy. You'll be planning your trip in minutes.

If you didn't expect this email, you can safely ignore it.

---
TravelPlan - Plan your perfect journey
  `.trim()
}
