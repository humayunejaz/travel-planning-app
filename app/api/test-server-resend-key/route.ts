import { NextResponse } from "next/server"
import { Resend } from "resend"

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY

  console.log("=== TESTING SERVER'S ACTUAL RESEND KEY ===")
  console.log("Key exists:", !!apiKey)
  console.log("Key preview:", apiKey ? `${apiKey.substring(0, 8)}...` : "None")

  if (!apiKey) {
    return NextResponse.json({
      valid: false,
      error: "No RESEND_API_KEY found in server environment",
      serverHasKey: false,
    })
  }

  if (!apiKey.startsWith("re_")) {
    return NextResponse.json({
      valid: false,
      error: `Server's API key has wrong format: ${apiKey.substring(0, 10)}...`,
      serverHasKey: true,
      keyFormat: "invalid",
    })
  }

  try {
    const resend = new Resend(apiKey)

    // Test with domains.list (doesn't send emails)
    const { data, error } = await resend.domains.list()

    if (error) {
      console.error("❌ Server's Resend key failed:", error)
      return NextResponse.json({
        valid: false,
        error: error.message || "Resend API rejected the key",
        serverHasKey: true,
        keyFormat: "valid",
        resendError: error,
      })
    }

    console.log("✅ Server's Resend key works!")
    return NextResponse.json({
      valid: true,
      message: "Server's API key is working perfectly",
      serverHasKey: true,
      keyFormat: "valid",
      domainsCount: data?.length || 0,
    })
  } catch (error) {
    console.error("❌ Error testing server's key:", error)
    return NextResponse.json(
      {
        valid: false,
        error: `Error testing key: ${error.message}`,
        serverHasKey: true,
        keyFormat: "unknown",
      },
      { status: 500 },
    )
  }
}
