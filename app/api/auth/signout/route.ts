import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST() {
  try {
    await supabase.auth.signOut()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error signing out:", error)
    return NextResponse.json({ error: "Failed to sign out" }, { status: 500 })
  }
}
