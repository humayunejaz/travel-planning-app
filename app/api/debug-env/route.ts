import { NextResponse } from "next/server"

export async function GET() {
  try {
    const hasResendKey = !!(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "")
    const hasAppUrl = !!(process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL !== "")

    return NextResponse.json({
      hasResendKey,
      hasAppUrl,
      resendKeyPreview: hasResendKey ? `${process.env.RESEND_API_KEY?.substring(0, 8)}...` : "Not set",
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000 (default)",
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to check environment" }, { status: 500 })
  }
}
