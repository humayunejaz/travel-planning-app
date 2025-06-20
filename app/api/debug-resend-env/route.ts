import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.RESEND_API_KEY

    return NextResponse.json({
      hasApiKey: !!apiKey,
      keyLength: apiKey?.length || 0,
      keyPreview: apiKey ? `${apiKey.substring(0, 8)}` : null,
      startsWithRe: apiKey ? apiKey.startsWith("re_") : false,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to check environment",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
