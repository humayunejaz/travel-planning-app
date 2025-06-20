import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY

  return NextResponse.json({
    configured: !!(apiKey && apiKey !== "" && apiKey !== "undefined"),
    hasKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    keyPreview: apiKey ? `${apiKey.substring(0, 8)}...` : "Not set",
  })
}
