// Pure rules for how a cash flow row affects stored valuations.
// Shared by Add, Edit and Delete so the three can never drift apart.
// No database access here, so this file is safe to import from client components.

export type CashFlowTag = "capital_gain" | "reinvestment" | null

export interface CashFlowLike {
  date: string
  type: string
  amount: number | string
  notes?: string | null
  description?: string | null
}

export interface ValuationLike {
  date: string
  value: number | string
}

// The DB only allows deposit/withdrawal/fee/tax/other, so capital gains and
// reinvestments are stored with a tag at the start of the notes.
const NOTE_TAGS = ["(Capital Gain)", "(Reinvestment)"]

function notesOf(cf: { notes?: string | null; description?: string | null }): string {
  return (cf.notes || cf.description || "").toLowerCase()
}

// Same classification the performance math in portfolio-calculations-v2 uses.
export function getCashFlowTag(type: string, notes: string | null | undefined): CashFlowTag {
  const t = (type || "").toLowerCase()
  const n = (notes || "").toLowerCase()

  if (t === "reinvestment" || (["other", "adjustment", "deposit"].includes(t) && n.includes("(reinvestment)"))) {
    return "reinvestment"
  }
  if (t === "capital_gain" || (t === "other" && n.includes("capital gain"))) {
    return "capital_gain"
  }
  return null
}

// Whether adding this cash flow moves the valuation on its date and every later one.
// Deposits, withdrawals and capital gains do. Fees, taxes, plain "other" rows and
// reinvestments (an internal profit-to-principal transfer) do not.
export function shiftsValuations(type: string, notes: string | null | undefined): boolean {
  const tag = getCashFlowTag(type, notes)
  if (tag === "reinvestment") return false
  if (tag === "capital_gain") return true
  const t = (type || "").toLowerCase()
  return t === "deposit" || t === "withdrawal"
}

// Sign convention used when saving: money out is negative, deposits are positive,
// and "other" (including capital gains) keeps the sign that was entered, so a
// negative capital gain records a loss.
export function normalizeAmount(type: string, entered: number): number {
  const t = (type || "").toLowerCase()
  if (t === "withdrawal" || t === "fee" || t === "tax") return -Math.abs(entered)
  if (t === "deposit") return Math.abs(entered)
  return entered
}

// Whether the admin types a plain positive number and the sign is applied for them.
export function hasAutomaticSign(type: string): boolean {
  return ["deposit", "withdrawal", "fee", "tax"].includes((type || "").toLowerCase())
}

// Splits a leading "(Capital Gain)" / "(Reinvestment)" tag off the notes so the
// admin can edit the free text without being able to remove the tag.
export function splitNoteTag(notes: string | null | undefined): { tag: string | null; text: string } {
  const raw = (notes || "").trim()
  const lower = raw.toLowerCase()
  for (const tag of NOTE_TAGS) {
    if (lower.startsWith(tag.toLowerCase())) {
      return { tag: raw.slice(0, tag.length), text: raw.slice(tag.length).trim() }
    }
  }
  return { tag: null, text: raw }
}

export function joinNoteTag(tag: string | null, text: string): string | null {
  const trimmed = text.trim()
  if (tag) return trimmed ? `${tag} ${trimmed}` : tag
  return trimmed || null
}

// The Investor Profile form's "Initial Capital" field edits the initial deposit row,
// and portfolios.initial_investment keeps a copy of its amount. "Add Investor" writes
// the second spelling, the profile form the first.
export const INITIAL_INVESTMENT_NOTES = ["Initial investment", "Initial investment deposit"]

export function isInitialInvestmentRow(type: string, notes: string | null | undefined): boolean {
  return (type || "").toLowerCase() === "deposit" && INITIAL_INVESTMENT_NOTES.includes((notes || "").trim())
}

export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100
}

// Money currently available to withdraw: the latest valuation plus every cash flow
// dated after it. Moved here unchanged from the Add Cash Flow overdraft check.
export function availableBalance(valuations: ValuationLike[], flows: CashFlowLike[]): number {
  const sortedValuations = [...valuations].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const latest = sortedValuations.length > 0 ? sortedValuations[sortedValuations.length - 1] : null
  if (!latest) return 0

  let balance = Number(latest.value)
  const latestDate = new Date(latest.date)

  flows
    .filter((cf) => new Date(cf.date) > latestDate)
    .forEach((cf) => {
      const t = (cf.type || "").toLowerCase()
      const a = Math.abs(Number(cf.amount))
      const n = notesOf(cf)

      if (t === "deposit") balance += a
      if (t === "withdrawal" || t === "fee" || t === "tax") balance -= a
      if (t === "capital_gain" || (t === "other" && n.includes("capital gain"))) balance += a
      if (t === "other" && !n.includes("capital gain")) balance += a
    })

  return balance
}
