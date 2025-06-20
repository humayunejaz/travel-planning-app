import { NextResponse } from "next/server"

export async function GET() {
  try {
    const resendKey = process.env.RESEND_API_KEY

    return NextResponse.json({
      hasResendKey: !!resendKey,
      keyInfo: resendKey
        ? {
            length: resendKey.length,
            preview: resendKey.substring(0, 8),
            startsWithRe: resendKey.startsWith("re_"),
            full: resendKey, // Only for comparison - remove in production
          }
        : null,
      allEnvKeys: Object.keys(process.env).filter(
        (key) => key.includes("RESEND") || key.includes("API") || key.includes("KEY"),
      ),
      nodeEnv: process.env.NODE_ENV,
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
