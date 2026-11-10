"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { editCashFlow, removeCashFlow } from "@/lib/cash-flows"

export type CashFlowActionResult = { ok: true } | { ok: false; error: string }

// Server actions are reachable by direct POST, so each one checks the caller's
// role itself instead of relying on the page that renders the button.
async function getAdminContext() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return null

  return { supabase, userId: user.id }
}

export async function updateCashFlowAction(input: {
  cashFlowId: string
  amount: string
  notes: string
}): Promise<CashFlowActionResult> {
  const ctx = await getAdminContext()
  if (!ctx) return { ok: false, error: "Only admins can edit cash flows." }

  const result = await editCashFlow(ctx.supabase, ctx.userId, input)
  if (!result.ok) return result

  revalidatePath(`/admin/portfolio/${result.portfolioId}`)
  return { ok: true }
}

export async function deleteCashFlowAction(input: { cashFlowId: string }): Promise<CashFlowActionResult> {
  const ctx = await getAdminContext()
  if (!ctx) return { ok: false, error: "Only admins can delete cash flows." }

  const result = await removeCashFlow(ctx.supabase, ctx.userId, input)
  if (!result.ok) return result

  revalidatePath(`/admin/portfolio/${result.portfolioId}`)
  return { ok: true }
}
