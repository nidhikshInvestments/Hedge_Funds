import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userData?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { portfolioId, entries } = await request.json()

    if (!portfolioId || !entries || entries.length === 0) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    // Insert all valuations
    const valuations = entries.map((entry: any) => ({
      portfolio_id: portfolioId,
      date: entry.date,
      value: entry.value,
      notes: entry.notes,
    }))

    const { error } = await supabase.from("portfolio_values").insert(valuations)

    if (error) {
      console.error("[v0] Bulk upload valuations error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: entries.length })
  } catch (error) {
    console.error("[v0] Bulk upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
