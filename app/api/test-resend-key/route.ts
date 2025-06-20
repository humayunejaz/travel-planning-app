import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

export async function GET() {
  return testApiKey(process.env.RESEND_API_KEY)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return testApiKey(body.apiKey)
}

async function testApiKey(apiKey: string | undefined) {
  console.log("=== TESTING RESEND API KEY ===")

  if (!apiKey) {
    return NextResponse.json({
      valid: false,
      error: "No API key provided",
      code: "NO_KEY",
    })
  }

  if (!apiKey.startsWith("re_")) {
    return NextResponse.json({
      valid: false,
      error: "Invalid API key format. Should start with 're_'",
      code: "INVALID_FORMAT",
      provided: `${apiKey.substring(0, 10)}...`,
    })
  }

  try {
    console.log("Testing API key:", `${apiKey.substring(0, 8)}...`)

    const resend = new Resend(apiKey)

    // Test the API key by trying to get domains (this doesn't send emails)
    const { data, error } = await resend.domains.list()

    if (error) {
      console.error("❌ Resend API error:", error)

      // Check for specific error types
      if (error.message?.includes("Invalid API key")) {
        return NextResponse.json({
          valid: false,
          error: "Invalid API key - please check your key from resend.com/api-keys",
          code: "INVALID_KEY",
          details: error,
        })
      }

      if (error.message?.includes("Unauthorized")) {
        return NextResponse.json({
          valid: false,
          error: "API key unauthorized - please generate a new key",
          code: "UNAUTHORIZED",
          details: error,
        })
      }

      return NextResponse.json({
        valid: false,
        error: error.message || "Unknown Resend API error",
        code: "RESEND_ERROR",
        details: error,
      })
    }

    console.log("✅ API key is valid!")
    console.log("Domains found:", data?.length || 0)

    return NextResponse.json({
      valid: true,
      message: "API key is valid and working",
      domainsCount: data?.length || 0,
      domains: data?.map((d) => d.name) || [],
      canSendToAnyEmail: (data?.length || 0) > 0,
      limitation:
        (data?.length || 0) === 0 ? "Can only send to your verified email address until you verify a domain" : null,
    })
  } catch (error: any) {
    console.error("❌ Error testing API key:", error)

    return NextResponse.json(
      {
        valid: false,
        error: `Failed to test API key: ${error.message}`,
        code: "TEST_ERROR",
        details: error,
      },
      { status: 500 },
    )
  }
}
