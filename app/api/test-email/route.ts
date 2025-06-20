import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(request: NextRequest) {
  try {
    console.log("=== EMAIL TEST DEBUG ===")
    console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY)
    console.log("RESEND_API_KEY preview:", process.env.RESEND_API_KEY?.substring(0, 10) + "...")
    console.log("NODE_ENV:", process.env.NODE_ENV)

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.log("❌ RESEND_API_KEY not found in environment")
      return NextResponse.json(
        {
          error: "RESEND_API_KEY not configured",
          hasKey: false,
          env: process.env.NODE_ENV,
        },
        { status: 500 },
      )
    }

    console.log("✅ RESEND_API_KEY found, initializing Resend...")

    const resend = new Resend(process.env.RESEND_API_KEY)
    const body = await request.json()

    console.log("Sending test email to:", body.recipientEmail)

    const { data, error } = await resend.emails.send({
      from: "TravelPlan Test <onboarding@resend.dev>",
      to: [body.recipientEmail],
      subject: "🧪 TravelPlan Email Test",
      html: `
        <h1>Email Test Successful!</h1>
        <p>This is a test email from TravelPlan.</p>
        <p><strong>Trip:</strong> ${body.tripTitle}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p>If you received this, your Resend integration is working! 🎉</p>
      `,
      text: `Email Test Successful! This is a test email from TravelPlan. Trip: ${body.tripTitle}. Time: ${new Date().toISOString()}`,
    })

    if (error) {
      console.error("❌ Resend error:", error)
      return NextResponse.json(
        {
          error: "Resend API error",
          details: error,
          hasKey: true,
        },
        { status: 500 },
      )
    }

    console.log("✅ Test email sent successfully:", data)
    return NextResponse.json({
      success: true,
      data,
      hasKey: true,
      message: "Test email sent successfully!",
    })
  } catch (error) {
    console.error("❌ Test email error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
        hasKey: !!process.env.RESEND_API_KEY,
      },
      { status: 500 },
    )
  }
}
