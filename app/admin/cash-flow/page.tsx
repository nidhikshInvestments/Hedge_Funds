import { redirect } from "next/navigation"
import { DashboardFooter } from "@/components/dashboard-footer"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ClickableDateInput } from "@/components/clickable-date-input"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"

export default async function AddCashFlowPage() {
  // Force Rebuild v2
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!userData?.is_admin) {
    redirect("/investor")
  }

  // Get all portfolios
  const { data: portfolios } = await supabase
    .from("portfolios")
    .select("*, users!portfolios_investor_id_fkey(full_name, email)")
    .order("created_at", { ascending: false })

  const handleAddCashFlow = async (formData: FormData) => {
    "use server"
    const supabase = await createClient()

    const portfolioId = formData.get("portfolio_id") as string
    const date = formData.get("date") as string
    const type = formData.get("type") as string
    const amountInput = formData.get("amount") as string
    const notes = formData.get("notes") as string

    // Correct Sign Logic per lib/portfolio-calculations.ts:
    // Deposits = POSITIVE (Adding Capital)
    // Withdrawals = NEGATIVE (Removing Capital)
    // Fees/Taxes = NEGATIVE (Expenses/Money Out)
    // Other = POSITIVE (Assumed Capital Add, unless specific negative case needed)

    let amount = Math.abs(Number.parseFloat(amountInput))

    if (type === "withdrawal" || type === "fee" || type === "tax") {
      amount = -amount // Expenses are negative flows
    } else {
      // 'deposit' and 'other' stay POSITIVE
      amount = amount
    }

    await supabase.from("cash_flows").insert({
      portfolio_id: portfolioId,
      date,
      amount,
      type,
      notes: notes || null,
    })

    /* 
    Legacy Auto-Update Logic DISABLED.
    We now calculate Current Value dynamically (Roll-Forward) based on the latest explicit valuation + subsequent flows.
    Writing hard-coded valuations here causes conflicts (e.g. double-counting or stale data).
    
    try {
      // 1. Handle the specific date of the flow
      const { data: sameDateValuation } = await supabase
        .from("portfolio_values")
        .select("*")
        .eq("portfolio_id", portfolioId)
        .eq("date", date)
        .maybeSingle()

      if (sameDateValuation) {
        // Update existing valuation for this day
        // If RPC exists use it, otherwise direct update
        await supabase.rpc("increment_portfolio_value", {
          row_id: sameDateValuation.id,
          amount: amount,
        })
      } else {
        // Create new valuation for this day if it doesn't exist
        // Base it on the most recent previous valuation
        const { data: prevValuation } = await supabase
          .from("portfolio_values")
          .select("value")
          .eq("portfolio_id", portfolioId)
          .lt("date", date)
          .order("date", { ascending: false })
          .limit(1)
          .maybeSingle()

        const baseValue = prevValuation ? Number(prevValuation.value) : 0
        const newValue = baseValue + amount

        await supabase.from("portfolio_values").insert({
          portfolio_id: portfolioId,
          date,
          value: newValue,
          notes: `Auto-updated from ${type}`,
        })
      }

      // 2. RIPPLE: Update all FUTURE valuations to maintain the "Running Balance"
      const { data: futureValuations } = await supabase
        .from("portfolio_values")
        .select("id, value")
        .eq("portfolio_id", portfolioId)
        .gt("date", date)

      if (futureValuations && futureValuations.length > 0) {
        console.log(`[Auto-Ripple] Updating ${futureValuations.length} future valuations by ${amount}`)
        for (const val of futureValuations) {
          await supabase
            .from("portfolio_values")
            .update({ value: Number(val.value) + amount })
            .eq("id", val.id)
        }
      }
    } catch (err) {
      console.error("[v0] Error updating valuations after cash flow:", err)
    }
    */

    redirect("/admin")
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-black">
        <div className="absolute left-1/4 top-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-r from-amber-500/30 to-yellow-600/30 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-r from-yellow-500/30 to-amber-600/30 blur-3xl animation-delay-2000" />
      </div>

      <nav className="relative z-10 border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-xl overflow-hidden">
              <Image
                src="/images/nidhiksh-logo.jpg"
                alt="Nidhiksh Investments Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
              Nidhiksh Investments
            </span>
          </div>
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-white/10 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto py-24 space-y-20">
        <Card className="mx-auto max-w-2xl border-2 border-amber-500/20 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white">Add Cash Flow</CardTitle>
            <CardDescription className="text-base text-slate-400">
              Record deposits, withdrawals, fees, or other cash movements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleAddCashFlow} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="portfolio_id" className="text-white">
                  Select Portfolio *
                </Label>
                <Select name="portfolio_id" required>
                  <SelectTrigger className="border-white/20 bg-slate-950/50 text-white">
                    <SelectValue placeholder="Choose a portfolio" />
                  </SelectTrigger>
                  <SelectContent className="border-white/20 bg-slate-950">
                    {portfolios?.map((portfolio) => (
                      <SelectItem key={portfolio.id} value={portfolio.id} className="text-white">
                        {portfolio.portfolio_name} - {portfolio.users?.full_name || portfolio.users?.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-white">
                  Transaction Type *
                </Label>
                <Select name="type" required>
                  <SelectTrigger className="border-white/20 bg-slate-950/50 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="border-white/20 bg-slate-950">
                    <SelectItem value="deposit" className="text-white">
                      Deposit (Money In)
                    </SelectItem>
                    <SelectItem value="withdrawal" className="text-white">
                      Withdrawal (Money Out)
                    </SelectItem>
                    <SelectItem value="fee" className="text-white">
                      Fee
                    </SelectItem>
                    <SelectItem value="tax" className="text-white">
                      Tax
                    </SelectItem>
                    <SelectItem value="other" className="text-white">
                      Other
                    </SelectItem>
                    <SelectItem value="capital_gain" className="text-white">
                      Capital Gain
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-white">
                  Transaction Date *
                </Label>
                <ClickableDateInput
                  id="date"
                  name="date"
                  required
                  className="border-white/20 bg-slate-950/50 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white">
                  Amount (USD) *
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="10000.00"
                  required
                  className="border-white/20 bg-slate-950/50 text-white"
                />
                <p className="text-xs text-slate-400">Enter positive amount (sign will be handled automatically)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-white">
                  Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Add any additional information about this transaction..."
                  className="border-white/20 bg-slate-950/50 text-white"
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-600 hover:to-yellow-600"
              >
                Add Cash Flow
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <DashboardFooter />
    </div>
  )
}
