import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If environment variables are not accessible in Edge Runtime (v0 preview limitation),
  // allow the request to proceed without auth middleware
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[v0] Supabase environment variables not available in proxy - authentication middleware disabled")
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  let user = null
  try {
    const { data, error } = await supabase.auth.getUser()
    if (!error) {
      user = data.user
    }
  } catch (error) {
    // Session is invalid or expired, treat user as not logged in
    console.log("[v0] Invalid session detected, clearing cookies")
    // Clear invalid session cookies
    supabaseResponse.cookies.delete("sb-access-token")
    supabaseResponse.cookies.delete("sb-refresh-token")
  }

  // Protect investor and admin routes
  if ((request.nextUrl.pathname.startsWith("/investor") || request.nextUrl.pathname.startsWith("/admin")) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Check role-based access
  if (user) {
    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    // Redirect admin to admin dashboard if trying to access investor
    if (request.nextUrl.pathname.startsWith("/investor") && userData?.role === "admin") {
      const url = request.nextUrl.clone()
      url.pathname = "/admin"
      return NextResponse.redirect(url)
    }

    // Redirect investor to investor dashboard if trying to access admin
    if (request.nextUrl.pathname.startsWith("/admin") && userData?.role === "investor") {
      const url = request.nextUrl.clone()
      url.pathname = "/investor"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
