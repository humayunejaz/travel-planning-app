import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(request: NextRequest) {
  const { testEmail } = await request.json()
  const apiKey = process.env.RESEND_API_KEY

  console.log("=== TESTING REAL EMAIL SEND ===")
  console.log("Using server's API key:", apiKey ? `${apiKey.substring(0, 8)}...` : "None")

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: "No API key in server environment",
    })
  }

  try {
    const resend = new Resend(apiKey)

    // Try to send to a test email (will fail if email is invalid, but that's OK)
    const { data, error } = await resend.emails.send({
      from: "TravelPlan <onboarding@resend.dev>",
      to: [testEmail || "test@example.com"],
      subject: "Test Email from Deep Debug",
      html: "<p>This is a test email from the deep debug tool.</p>",
    })

    if (error) {
      // Check if it's just an invalid email (which means the API key works)
      if (error.message?.includes("Invalid email") || error.message?.includes("not a valid email")) {
        return NextResponse.json({
          success: true,
          message: "API key works! (Email address was invalid, but that's expected)",
          wouldWork: true,
          error: error.message,
        })
      }

      // Check if it's the testing limitation
      if (error.message?.includes("testing emails")) {
        return NextResponse.json({
          success: true,
          message: "API key works! (Limited to verified emails in testing mode)",
          wouldWork: true,
          limitation: "testing_mode",
          error: error.message,
        })
      }

      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Email would send successfully!",
      emailId: data?.id,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: `Server error: ${error.message}`,
        details: error,
      },
      { status: 500 },
    )
  }
}
