import type { SupabaseClient } from "@supabase/supabase-js"
import {
  INITIAL_INVESTMENT_NOTES,
  availableBalance,
  getCashFlowTag,
  isInitialInvestmentRow,
  joinNoteTag,
  normalizeAmount,
  roundToCents,
  shiftsValuations,
  splitNoteTag,
} from "@/lib/cash-flow-rules"

// Database operations that change cash flows after the fact.
// Every function takes the Supabase client as a parameter so the same logic can
// back the admin web UI today and an API for the mobile apps later.
//
// Why later valuations move: each valuation is the previous one plus everything
// that happened in between, so a corrected amount must shift the valuation on
// that date and every later one. Otherwise the next month silently absorbs the
// difference as fake profit or loss.

export type CashFlowResult = { ok: true; portfolioId: string } | { ok: false; error: string }

interface CashFlowRow {
  id: string
  portfolio_id: string
  date: string
  type: string
  amount: number | string
  notes: string | null
  [key: string]: unknown
}

interface ValuationRow {
  id: string
  portfolio_id: string
  date: string
  value: number | string
  [key: string]: unknown
}

async function fetchCashFlow(supabase: SupabaseClient, id: string): Promise<CashFlowRow | null> {
  const { data, error } = await supabase.from("cash_flows").select("*").eq("id", id).maybeSingle()
  if (error) {
    console.error("[CashFlows] Failed to load cash flow:", error.message)
    return null
  }
  return data as CashFlowRow | null
}

// Adds `delta` to the valuation on `fromDate` and every later one, in a single
// statement so either all of them move or none do. Returns the original rows so
// the caller can restore them if the next step fails.
async function shiftValuationsFrom(
  supabase: SupabaseClient,
  portfolioId: string,
  fromDate: string,
  delta: number,
): Promise<{ ok: true; original: ValuationRow[] } | { ok: false; error: string }> {
  // Full rows, so the upsert below never trips over a required column that exists
  // in the live database but not in scripts/.
  const { data, error } = await supabase
    .from("portfolio_values")
    .select("*")
    .eq("portfolio_id", portfolioId)
    .gte("date", fromDate)

  if (error) return { ok: false, error: `Could not load valuations: ${error.message}` }

  const original = (data || []) as ValuationRow[]
  if (original.length === 0 || delta === 0) return { ok: true, original: [] }

  const shifted = original.map((v) => ({ ...v, value: roundToCents(Number(v.value) + delta) }))
  const { error: upsertError } = await supabase.from("portfolio_values").upsert(shifted, { onConflict: "id" })
  if (upsertError) return { ok: false, error: `Could not update valuations: ${upsertError.message}` }

  return { ok: true, original }
}

async function restoreValuations(supabase: SupabaseClient, original: ValuationRow[]) {
  if (original.length === 0) return
  const { error } = await supabase.from("portfolio_values").upsert(original, { onConflict: "id" })
  if (error) {
    // Valuations were shifted but the cash flow change failed. Log everything
    // needed to repair by hand.
    console.error("[CashFlows] CRITICAL: failed to restore valuations after a failed cash flow write:", {
      error: error.message,
      original,
    })
  }
}

// Keeps portfolios.initial_investment (the profile form's "Initial Capital") equal
// to the initial deposit row, so saving the profile can't undo a correction.
async function setInitialInvestment(
  supabase: SupabaseClient,
  portfolioId: string,
  value: number,
): Promise<{ ok: true; previous: unknown } | { ok: false; error: string }> {
  const { data: current, error } = await supabase
    .from("portfolios")
    .select("initial_investment")
    .eq("id", portfolioId)
    .maybeSingle()
  if (error || !current) return { ok: false, error: `Could not load the portfolio: ${error?.message || "not found"}` }

  const { data: updated, error: updateError } = await supabase
    .from("portfolios")
    .update({ initial_investment: value })
    .eq("id", portfolioId)
    .select("id")
  if (updateError || !updated || updated.length === 0) {
    return { ok: false, error: `Could not update Initial Capital: ${updateError?.message || "not allowed"}` }
  }
  return { ok: true, previous: (current as { initial_investment: unknown }).initial_investment }
}

async function restoreInitialInvestment(supabase: SupabaseClient, portfolioId: string, previous: unknown) {
  const { error } = await supabase.from("portfolios").update({ initial_investment: previous }).eq("id", portfolioId)
  if (error) {
    console.error("[CashFlows] CRITICAL: failed to restore Initial Capital:", { portfolioId, previous, error: error.message })
  }
}

// Best effort: a missing audit table must never block the admin's change.
async function writeAuditLog(
  supabase: SupabaseClient,
  userId: string,
  action: "update" | "delete",
  before: CashFlowRow,
  after: CashFlowRow | null,
) {
  const { error } = await supabase.from("audit_log").insert({
    entity_type: "cash_flow",
    entity_id: before.id,
    action,
    before_json: before,
    after_json: after,
    changed_by: userId,
  })
  if (error) console.error("[CashFlows] Audit log write failed:", error.message)
}

export async function editCashFlow(
  supabase: SupabaseClient,
  userId: string,
  input: { cashFlowId: string; amount: string; notes: string },
): Promise<CashFlowResult> {
  const entered = Number.parseFloat(input.amount)
  if (!Number.isFinite(entered) || entered === 0) {
    return { ok: false, error: "Enter an amount other than zero. To remove this row, use Delete." }
  }

  const row = await fetchCashFlow(supabase, input.cashFlowId)
  if (!row) return { ok: false, error: "This cash flow no longer exists. Refresh the page." }

  const oldAmount = Number(row.amount)
  const newAmount = roundToCents(normalizeAmount(row.type, entered))
  const newNotes = joinNoteTag(splitNoteTag(row.notes).tag, input.notes)
  const linkedToProfile = isInitialInvestmentRow(row.type, row.notes)

  // Notes drive how the performance math classifies a row, so an edit must not
  // turn a row into (or out of) a capital gain or reinvestment.
  if (getCashFlowTag(row.type, newNotes) !== getCashFlowTag(row.type, row.notes)) {
    return {
      ok: false,
      error:
        'These notes would change how this row is counted ("Capital Gain" or "Reinvestment"). Delete the row and add it again instead.',
    }
  }

  // The profile form finds the initial deposit by its exact note.
  if (linkedToProfile && (newNotes || "") !== (row.notes || "").trim()) {
    return {
      ok: false,
      error: "This is the initial investment linked to Initial Capital in the Investor Profile, so its note can't change.",
    }
  }

  const delta = roundToCents(newAmount - oldAmount)
  if (delta === 0 && newNotes === (row.notes || null)) return { ok: true, portfolioId: row.portfolio_id }

  // Same overdraft rule as Add: a bigger withdrawal can't exceed what's available.
  if (row.type.toLowerCase() === "withdrawal" && delta < 0) {
    const [{ data: valuations }, { data: flows }] = await Promise.all([
      supabase.from("portfolio_values").select("date, value").eq("portfolio_id", row.portfolio_id),
      supabase.from("cash_flows").select("*").eq("portfolio_id", row.portfolio_id),
    ])
    const available = availableBalance(valuations || [], flows || [])
    const increase = Math.abs(delta)
    if (increase > available + 0.01) {
      return {
        ok: false,
        error: `Insufficient funds. Available: $${available.toFixed(2)}, extra withdrawal requested: $${increase.toFixed(2)}`,
      }
    }
  }

  // Steps run cheapest-to-undo first; any failure undoes the earlier steps.
  let previousInitialInvestment: unknown = undefined
  if (linkedToProfile && delta !== 0) {
    const sync = await setInitialInvestment(supabase, row.portfolio_id, newAmount)
    if (!sync.ok) return sync
    previousInitialInvestment = sync.previous
  }
  const undoProfile = async () => {
    if (previousInitialInvestment !== undefined) {
      await restoreInitialInvestment(supabase, row.portfolio_id, previousInitialInvestment)
    }
  }

  let original: ValuationRow[] = []
  if (delta !== 0 && shiftsValuations(row.type, row.notes)) {
    const shift = await shiftValuationsFrom(supabase, row.portfolio_id, row.date, delta)
    if (!shift.ok) {
      await undoProfile()
      return shift
    }
    original = shift.original
  }

  const { data: updated, error: updateError } = await supabase
    .from("cash_flows")
    .update({ amount: newAmount, notes: newNotes })
    .eq("id", row.id)
    .select("*")
    .maybeSingle()

  if (updateError || !updated) {
    await restoreValuations(supabase, original)
    await undoProfile()
    return { ok: false, error: `Could not save the change: ${updateError?.message || "row not found"}` }
  }

  await writeAuditLog(supabase, userId, "update", row, updated as CashFlowRow)
  return { ok: true, portfolioId: row.portfolio_id }
}

export async function removeCashFlow(
  supabase: SupabaseClient,
  userId: string,
  input: { cashFlowId: string },
): Promise<CashFlowResult> {
  const row = await fetchCashFlow(supabase, input.cashFlowId)
  if (!row) return { ok: false, error: "This cash flow no longer exists. Refresh the page." }

  // Without this, the next profile save would re-create the deleted deposit.
  let previousInitialInvestment: unknown = undefined
  if (isInitialInvestmentRow(row.type, row.notes)) {
    const sync = await setInitialInvestment(supabase, row.portfolio_id, 0)
    if (!sync.ok) return sync
    previousInitialInvestment = sync.previous
  }
  const undoProfile = async () => {
    if (previousInitialInvestment !== undefined) {
      await restoreInitialInvestment(supabase, row.portfolio_id, previousInitialInvestment)
    }
  }

  // Undo exactly what Add did: only rows that moved valuations move them back.
  let original: ValuationRow[] = []
  if (shiftsValuations(row.type, row.notes)) {
    const shift = await shiftValuationsFrom(supabase, row.portfolio_id, row.date, -Number(row.amount))
    if (!shift.ok) {
      await undoProfile()
      return shift
    }
    original = shift.original
  }

  const { data: deleted, error: deleteError } = await supabase
    .from("cash_flows")
    .delete()
    .eq("id", row.id)
    .select("id")

  if (deleteError || !deleted || deleted.length === 0) {
    await restoreValuations(supabase, original)
    await undoProfile()
    return { ok: false, error: `Could not delete: ${deleteError?.message || "row not found"}` }
  }

  await writeAuditLog(supabase, userId, "delete", row, null)
  return { ok: true, portfolioId: row.portfolio_id }
}

// "Initial Capital" + "Investment Start Date" on the Investor Profile form.
// Saving the profile without changing these must not touch any money rows, and
// changing the amount must move later valuations exactly like editing the row in
// the Cash Flows table.
export async function applyInitialCapital(
  supabase: SupabaseClient,
  userId: string,
  input: { portfolioId: string; amount: number; startDate: string },
): Promise<CashFlowResult> {
  const { portfolioId, startDate } = input
  const amount = roundToCents(input.amount)

  const { data, error } = await supabase
    .from("cash_flows")
    .select("*")
    .eq("portfolio_id", portfolioId)
    .eq("type", "deposit")
    .in("notes", INITIAL_INVESTMENT_NOTES)
  if (error) return { ok: false, error: `Could not load the initial investment: ${error.message}` }

  const rows = (data || []) as CashFlowRow[]
  if (rows.length > 1) {
    return {
      ok: false,
      error:
        "This portfolio has more than one initial investment row. Remove the duplicate in the Cash Flows table, then save the profile again.",
    }
  }
  const row = rows[0]

  if (row) {
    const amountChanged = roundToCents(Number(row.amount)) !== amount
    const dateChanged = row.date !== startDate

    if (!amountChanged && !dateChanged) {
      // Nothing about the money changed. Just make sure the stored copy matches.
      const sync = await setInitialInvestment(supabase, portfolioId, amount)
      return sync.ok ? { ok: true, portfolioId } : sync
    }

    if (amountChanged && !dateChanged) {
      return editCashFlow(supabase, userId, { cashFlowId: row.id, amount: String(amount), notes: row.notes || "" })
    }

    // Start date moved: unchanged legacy behavior (moves the deposit and sets the
    // valuation on the new start date). Later valuations are not shifted here.
    const { error: moveError } = await supabase
      .from("cash_flows")
      .update({ amount, date: startDate })
      .eq("id", row.id)
    if (moveError) return { ok: false, error: `Could not move the initial investment: ${moveError.message}` }
    await setStartDateValuation(supabase, portfolioId, startDate, amount)
    const sync = await setInitialInvestment(supabase, portfolioId, amount)
    return sync.ok ? { ok: true, portfolioId } : sync
  }

  // No initial deposit yet (new portfolio): unchanged legacy behavior, except that
  // a zero amount no longer creates an empty deposit and a $0 valuation.
  if (amount > 0) {
    const { error: insertError } = await supabase.from("cash_flows").insert({
      portfolio_id: portfolioId,
      type: "deposit",
      amount,
      date: startDate,
      notes: INITIAL_INVESTMENT_NOTES[0],
    })
    if (insertError) return { ok: false, error: `Could not add the initial investment: ${insertError.message}` }
    await setStartDateValuation(supabase, portfolioId, startDate, amount)
  }
  const sync = await setInitialInvestment(supabase, portfolioId, amount)
  return sync.ok ? { ok: true, portfolioId } : sync
}

async function setStartDateValuation(supabase: SupabaseClient, portfolioId: string, date: string, value: number) {
  const { data: existing } = await supabase
    .from("portfolio_values")
    .select("id")
    .eq("portfolio_id", portfolioId)
    .eq("date", date)
    .maybeSingle()

  const { error } = existing
    ? await supabase.from("portfolio_values").update({ value, notes: "Initial valuation" }).eq("id", existing.id)
    : await supabase.from("portfolio_values").insert({ portfolio_id: portfolioId, date, value, notes: "Initial valuation" })
  if (error) console.error("[CashFlows] Failed to set the start date valuation:", error.message)
}
