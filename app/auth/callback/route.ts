import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const type = requestUrl.searchParams.get("type")
  const next = requestUrl.searchParams.get("next")

  console.log("[v0] Auth callback - code:", code ? "present" : "missing")
  console.log("[v0] Auth callback - type:", type)
  console.log("[v0] Auth callback - next:", next)

  if (code) {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("[v0] Error exchanging code for session:", error)
      return NextResponse.redirect(new URL("/login?error=auth_error", requestUrl.origin))
    }

    if (type === "recovery") {
      console.log("[v0] Recovery type detected, redirecting to reset password")
      return NextResponse.redirect(new URL("/reset-password", requestUrl.origin))
    }

    if (next) {
      console.log("[v0] Redirecting to next:", next)
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }

    // Get user role to redirect appropriately
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

      if (userData?.role === "admin") {
        console.log("[v0] Admin user, redirecting to /admin")
        return NextResponse.redirect(new URL("/admin", requestUrl.origin))
      } else {
        console.log("[v0] Investor user, redirecting to /investor")
        return NextResponse.redirect(new URL("/investor", requestUrl.origin))
      }
    }
  }

  console.log("[v0] No code found, redirecting to /login")
  return NextResponse.redirect(new URL("/login", requestUrl.origin))
}
