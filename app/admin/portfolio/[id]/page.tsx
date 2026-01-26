import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  TrendingUp,
  Trash2,
  AlertTriangle,
  Pencil,
  ArrowLeft,
  Plus,

  Info,
  ExternalLink,
} from "lucide-react"
import { BulkUpload } from "./bulk-upload"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { ClickableDateInput } from "@/components/clickable-date-input"
import { AdminPeriodSelector } from "@/components/admin-period-selector"
import { calculatePortfolioMetrics, calculateMonthlyPerformanceV2, filterByRange, calculateTWR, Valuation, CashFlow } from "@/lib/portfolio-calculations-v2"
import { formatCurrency, formatPercentage } from "@/lib/utils"
// Import standard Supabase client for Admin Context
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"

export default async function ManagePortfolioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ period?: string }>
}) {
  // Force Rebuild v7
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const portfolioId = resolvedParams.id
  const period = (resolvedSearchParams.period as "ALL" | "YTD" | "monthly" | "yearly") || "ALL"



  let errorType: string | null = null
  let errorDetails: string | null = null
  const warnings: { type: string; message: string }[] = []
  let successfullyLoaded = false

  let supabase
  let user
  let userData

  try {
    supabase = await createClient()
  } catch (error) {
    console.error("[v0] Failed to create Supabase client:", error)
    errorType = "supabase_connection_failed"
    errorDetails = error instanceof Error ? error.message : "Unknown error"
  }

  if (!errorType) {
    try {
      const authResult = await supabase.auth.getUser()
      user = authResult.data.user
    } catch (error) {
      console.error("[v0] Failed to get user:", error)
      redirect("/login")
    }

    if (!user) {
      redirect("/login")
    }

    try {
      const userDataResult = await supabase.from("users").select("*").eq("id", user.id).limit(1)
      userData = userDataResult.data?.[0]
    } catch (error) {
      console.error("[v0] Failed to get user data:", error)
      errorType = "user_data_failed"
      errorDetails = error instanceof Error ? error.message : "Unknown error"
    }

    if (userData?.role !== "admin") {
      redirect("/investor")
    }
  }



  let finalPortfolio: any = null

  if (!errorType) {
    try {
      // Step 1: Try to find portfolio by ID first

      const { data: portfolioByIdData, error: portfolioByIdError } = await supabase
        .from("portfolios")
        .select(
          "id, investor_id, portfolio_name, initial_investment, start_date, notes, created_at, updated_at, total_deposits",
        )
        .eq("id", portfolioId)
        .limit(1)



      if (portfolioByIdData && portfolioByIdData.length > 0) {
        finalPortfolio = portfolioByIdData[0]
        successfullyLoaded = true


        if (!finalPortfolio.investor_id) {
          console.error("[v0] Portfolio has no investor_id!")
          warnings.push({ type: "missing_investor", message: "Portfolio is missing investor information" })
        } else {
          // Fetch investor data
          const { data: investorDataResult, error: investorError } = await supabase
            .from("users")
            .select("*")
            .eq("id", finalPortfolio.investor_id)
            .limit(1)



          if (investorDataResult && investorDataResult.length > 0) {
            finalPortfolio.users = investorDataResult[0]

          } else {
            console.error("[v0] Could not find investor for portfolio")
            warnings.push({
              type: "investor_not_found",
              message: `Could not load investor data (ID: ${finalPortfolio.investor_id})`,
            })
          }
        }
      } else {
        // Step 2: Try to find portfolio by investor_id

        const { data: portfolioByInvestorData, error: portfolioByInvestorError } = await supabase
          .from("portfolios")
          .select(
            "id, investor_id, portfolio_name, initial_investment, start_date, notes, created_at, updated_at, total_deposits",
          )
          .eq("investor_id", portfolioId)
          .limit(1)



        if (portfolioByInvestorData && portfolioByInvestorData.length > 0) {
          finalPortfolio = portfolioByInvestorData[0]
          successfullyLoaded = true


          if (!portfolioId || portfolioId === "undefined") {
            console.error("[v0] Invalid portfolioId!")
            warnings.push({ type: "invalid_id", message: "Invalid portfolio or investor ID" })
          } else {
            const { data: investorDataResult, error: investorError } = await supabase
              .from("users")
              .select("*")
              .eq("id", portfolioId)
              .limit(1)



            if (investorDataResult && investorDataResult.length > 0) {
              finalPortfolio.users = investorDataResult[0]

            } else {
              console.error("[v0] Could not find investor")
              warnings.push({
                type: "investor_not_found",
                message: `Could not load investor data (ID: ${portfolioId})`,
              })
            }
          }
        } else {
          // Step 3: No portfolio exists, try to create one for this investor


          if (!portfolioId || portfolioId === "undefined") {
            console.error("[v0] Invalid portfolioId for creation!")
            errorType = "investor_not_found"
            errorDetails = "Invalid investor ID parameter"
          } else {
            const { data: investorCheckData, error: investorCheckError } = await supabase
              .from("users")
              .select("*")
              .eq("id", portfolioId)
              .limit(1)



            if (investorCheckData && investorCheckData.length > 0) {

              const { data: newPortfolioData, error: createError } = await supabase
                .from("portfolios")
                .insert({
                  investor_id: portfolioId,
                  portfolio_name: `${investorCheckData[0]?.full_name || "Investor"} Portfolio`,
                  initial_investment: 0,
                  start_date: new Date().toISOString().split("T")[0],
                })
                .select()
                .limit(1)

              if (newPortfolioData && newPortfolioData.length > 0) {
                finalPortfolio = newPortfolioData[0]
                finalPortfolio.users = investorCheckData[0]
                successfullyLoaded = true

                warnings.push({
                  type: "new_portfolio",
                  message: "New portfolio created. Please set initial investment and start date.",
                })
              } else {
                console.error("[v0] Failed to create portfolio")
                errorType = "investor_not_found"
                errorDetails = createError?.message || "Failed to create portfolio for investor"
              }
            } else {
              console.error("[v0] Investor does not exist")
              errorType = "investor_not_found"
              errorDetails = investorCheckError?.message || `Investor ID ${portfolioId} does not exist`
            }
          }
        }
      }
    } catch (error) {
      console.error("[v0] Error during portfolio lookup:", error)
      if (
        error &&
        typeof error === "object" &&
        "digest" in error &&
        typeof error.digest === "string" &&
        error.digest.startsWith("NEXT_REDIRECT")
      ) {
        throw error
      }
      if (finalPortfolio && successfullyLoaded) {
        warnings.push({
          type: "partial_error",
          message: error instanceof Error ? error.message : "Some data may be incomplete",
        })
      } else {
        errorType = "portfolio_lookup_failed"
        errorDetails = error instanceof Error ? error.message : "Unknown error during lookup"
      }
    }
  }

  if (errorType && !successfullyLoaded) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Card className="mx-auto max-w-2xl border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Portfolio</CardTitle>
            <CardDescription>Could not load the portfolio data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold">Error Type: {errorType}</p>
              <p className="text-muted-foreground">Details: {errorDetails}</p>
              <p className="text-muted-foreground">Portfolio ID: {portfolioId}</p>
            </div>
            <Button asChild>
              <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Admin Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }



  // Get all cash flows for this portfolio
  const { data: cashFlows } = await supabase
    .from("cash_flows")
    .select("*")
    .eq("portfolio_id", finalPortfolio.id)
    .order("date", { ascending: false })

  // Get all portfolio values
  const { data: portfolioValues } = await supabase
    .from("portfolio_values")
    .select("*")
    .eq("portfolio_id", finalPortfolio.id)
    .order("date", { ascending: false })

  // Sort data for Visual Tables (Descending - Newest First) to ensure consistent UI order
  // Tie-breaker: created_at to preserve entry order for same-day items (Newest created = Top)
  if (portfolioValues) {
    portfolioValues.sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
      if (dateDiff !== 0) return dateDiff
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }

  if (cashFlows) {
    cashFlows.sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
      if (dateDiff !== 0) return dateDiff
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    })
  }

  // --- CALCULATION LOGIC START ---
  // Re-sort for calculation (ascending)
  const calcValuations = [...(portfolioValues || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const calcCashFlows = [...(cashFlows || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Current Value
  const globalLatestValuation = calcValuations.length > 0 ? calcValuations[calcValuations.length - 1] : null
  let currentValue = globalLatestValuation ? Number(globalLatestValuation.value) : 0

  // Adjust Current Value: Apply ALL flows occurring AFTER the last valuation
  if (globalLatestValuation) {
    const lastValDate = new Date(globalLatestValuation.date)

    const subsequentFlows = (calcCashFlows || []).filter((cf: any) => {
      return new Date(cf.date) > lastValDate;
    });

    subsequentFlows.forEach((cf: any) => {
      const type = (cf.type || '').toLowerCase();
      const amt = Math.abs(Number(cf.amount));
      const notes = (cf.notes || cf.description || '').toLowerCase();

      if (type === 'reinvestment' ||
        (type === 'other' && notes.includes('(reinvestment)')) ||
        (type === 'deposit' && notes.includes('reinvestment'))) {
        // Internal Reclassification (Profit -> Principal)
        // Does NOT change Total Portfolio Value. Ignore.
        return;
      }

      if (type === 'deposit') {
        currentValue += amt;
      } else if (type === 'withdrawal' || type === 'fee' || type === 'tax') {
        currentValue -= amt;
      } else if (type === 'capital_gain') {
        currentValue += amt;
      } else if (type === 'other') {
        // Workaround Check for Capital Gain
        if (notes.includes('capital gain')) {
          currentValue += amt;
        } else {
          // Generic 'other' - assume positive add? Or safely ignore?
          // Usually 'other' is money in.
          currentValue += amt;
        }
      }
    });
  }

  // --- SYNTHETIC VALUATION FOR LIVE METRICS ---
  // We inject the calculated 'Current Value' as a valuation "Right Now" AND at the time of the last flow.
  // This ensures that if a flow determines the EOM value (e.g. Total Withdrawal), the period closes correctly.

  const syntheticValuations = [...calcValuations];

  if (calcCashFlows.length > 0) {
    const lastFlow = calcCashFlows[calcCashFlows.length - 1];
    const lastVal = calcValuations.length > 0 ? calcValuations[calcValuations.length - 1] : null;

    // If the last flow is NEWER than the last valuation, inject a valuation event there.
    // This helps the Monthly Bucket logic "see" the drop in value for that month.
    if (!lastVal || new Date(lastFlow.date) > new Date(lastVal.date)) {
      syntheticValuations.push({
        id: "synthetic-last-flow",
        portfolio_id: finalPortfolio.id,
        date: lastFlow.date,
        value: currentValue, // The rolled-forward value matches the state after this flow
        created_at: new Date(lastFlow.date).toISOString() // Tie-break: same time as flow?
        // Ideally created_at should be slightly AFTER flow to ensure it captures it?
        // But 'Smart Sort' uses date.
      });
    }
  }

  // Always inject "Now" to close the current partial period
  syntheticValuations.push({
    id: "synthetic-now",
    portfolio_id: finalPortfolio.id,
    date: new Date().toISOString(),
    value: currentValue,
    created_at: new Date().toISOString()
  });

  // 1. Lifetime Metrics (Net Invested Capital)
  // PASS SYNTHETIC VALUATIONS
  const lifetimeMetrics = calculatePortfolioMetrics(currentValue, cashFlows, syntheticValuations)


  // 2. Period Filtering
  // Use synthetic list here too?
  // Probably yes, if we want period stats to resolve current day correctly.
  const { filteredValuations, filteredCashFlows } = filterByRange(syntheticValuations, calcCashFlows, period)

  // 3. Period Metrics (PnL)
  const periodMetrics = calculatePortfolioMetrics(currentValue, filteredCashFlows, filteredValuations)

  // 4. Calculate Period PnL explicitly
  let periodPnL = 0
  let periodReturn = 0



  if (period === "ALL") {
    periodPnL = lifetimeMetrics.totalPnL

    // Simple return for All Time:
    // Ideally PnL / NetInvested.
    // However, if NetInvested is 0 (Fully Withdrawn), we should use TotalInvested (Capital Deployed) as denominator to show ROI.
    // If NetInvested > 0, we use NetInvested (Current Basis).
    // Actually, "Total Return on Invested Capital" usually uses Total Invested for the denominator if fully realized.
    // Let's use a hybrid: If NetInvested is small, use TotalInvested.

    const denominator = lifetimeMetrics.netContributions > 1 ? lifetimeMetrics.netContributions : lifetimeMetrics.totalInvested;

    periodReturn = denominator > 0 ? (periodPnL / denominator) * 100 : 0
  } else {
    // For specific periods, find baseline
    const now = new Date()
    let startDate: Date | null = null
    switch (period) {
      case "monthly": startDate = new Date(now.getFullYear(), now.getMonth(), 1); break
      case "YTD": startDate = new Date(now.getFullYear(), 0, 1); break
      case "yearly": startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()); break
    }

    if (syntheticValuations.length > 0 && startDate) {
      // Find valuation strictly before start date (Baseline)
      // Use syntheticValuations to account for 'Phantom Drops' like the Dec 31 withdrawal
      const baselineValuation = syntheticValuations.filter(v => new Date(v.date) < startDate!).pop()

      const startValue = baselineValuation ? Number(baselineValuation.value) : 0

      // FIXED: Use Net Cash Flow (Invested - Withdrawn) for PnL calculation, 
      // NOT Net Invested Capital (which excludes profit withdrawals).
      // If we use Net Invested ($0), we miss the $5k profit withdrawal in the math.
      // Net Flow = 100k In - 105k Out = -5k.
      // PnL = 0 (End) - 0 (Start) - (-5k) = +5k. Correct.
      const netFlowPeriod = periodMetrics.totalInvested - periodMetrics.totalWithdrawn

      periodPnL = currentValue - startValue - netFlowPeriod

      // Simple return approximation for period
      const denominator = startValue + Math.max(0, netFlowPeriod) // Simplified denominator
      periodReturn = denominator > 0 ? (periodPnL / denominator) * 100 : 0
    }
  }


  // Calculate Nidhiksh Performance (Time Weighted Return)
  // We perform a "Pro-Forma" calculation using the updated syntheticValuations
  let twrInputValuations = syntheticValuations;
  let twrInputFlows = calcCashFlows;

  if (period !== 'ALL') {
    // Need to include the Baseline Valuation as the "Starting Point" for TWR
    // baselineValuation is found above in the 'else' block. We need to access it.
    // Refactoring: The baseline finding logic is inside the `else` block. 
    // I should duplicate the baseline logic or lift it out? Lifting out is safer.
    // But for minimal edit, let's just grab the relevant data.

    const now = new Date()
    let startDate: Date | null = null
    switch (period) {
      case "monthly": startDate = new Date(now.getFullYear(), now.getMonth(), 1); break
      case "YTD": startDate = new Date(now.getFullYear(), 0, 1); break
      case "yearly": startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()); break
    }

    if (startDate) {
      const baseline = syntheticValuations.filter(v => new Date(v.date) < startDate!).pop();
      if (baseline) {
        // TWR needs [Start, ...Intermediates, End]
        // filteredValuations has intermediates. End might be 'synthetic-now' if inside filtered?
        // 'filterByRange' usually includes 'now' if it falls in range.
        twrInputValuations = [baseline, ...filteredValuations];
        twrInputFlows = filteredCashFlows;
      }
    }
  }

  const twr = calculateTWR(twrInputValuations, twrInputFlows)
  const nidhikshPerformance = twr !== null ? twr : 0


  // Calculate Nidhiksh Performance (Time Weighted Return)


  // Determine Time Period for Gain/Loss Label
  let timePeriodLabel = "Since Inception"
  if (calcCashFlows.length > 0 || calcValuations.length > 0) {
    const dates = [
      ...calcCashFlows.map(c => new Date(c.date).getTime()),
      ...calcValuations.map(v => new Date(v.date).getTime())
    ].filter(t => !isNaN(t))

    if (dates.length > 0) {
      const minDate = new Date(Math.min(...dates))
      timePeriodLabel = `Since ${minDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    }
  }

  const handleAddValuation = async (formData: FormData) => {
    "use server"
    const supabase = await createClient()

    const date = formData.get("valuation_date") as string
    const value = formData.get("valuation_value") as string
    const notes = formData.get("valuation_notes") as string

    await supabase.from("portfolio_values").insert({
      portfolio_id: finalPortfolio.id,
      date,
      value: Number.parseFloat(value),
      notes: notes || null,
    })

    redirect(`/admin/portfolio/${finalPortfolio.id}`)
  }

  const handleAddCashFlow = async (formData: FormData) => {
    "use server"
    const supabase = await createClient()

    const date = formData.get("cf_date") as string
    const type = formData.get("cf_type") as string
    const amount = formData.get("cf_amount") as string
    const notes = formData.get("cf_notes") as string

    // Per spec: deposits are POSITIVE; withdrawals, fees, taxes and CAPITAL GAINS are NEGATIVE
    let finalAmount = Number.parseFloat(amount)
    if (type === "withdrawal" || type === "fee" || type === "tax") {
      finalAmount = -Math.abs(finalAmount)
    } else {
      if (type === "deposit") {
        finalAmount = Math.abs(finalAmount)
      }
    }

    // DB Constraint Workaround: Map 'capital_gain' to 'other'
    let finalType = type
    let finalNotes = notes || ""

    if (type === 'capital_gain') {
      finalType = 'other'
      finalNotes = finalNotes ? `(Capital Gain) ${finalNotes}` : "(Capital Gain)"
    }

    // --- OVERDRAFT PROTECTION ---
    // User requested: "make sure more amount to withdrwa is not permitted than proifit + principal"
    if (type === 'withdrawal') {
      // We need to calculate the REAL available balance (Current Value) before allowing this.
      // 1. Fetch all historic data
      const { data: dbValuations } = await supabase.from("portfolio_values").select("*").eq("portfolio_id", finalPortfolio.id).order("date", { ascending: true })
      const { data: dbFlows } = await supabase.from("cash_flows").select("*").eq("portfolio_id", finalPortfolio.id)

      // 2. Calculate Current Value using same logic as page
      // Sort
      const calcVals = (dbValuations || []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      const calcFlows = (dbFlows || []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      const latVal = calcVals.length > 0 ? calcVals[calcVals.length - 1] : null
      let maxWithdrawable = latVal ? Number(latVal.value) : 0

      if (latVal) {
        const lvDate = new Date(latVal.date)
        const subs = calcFlows.filter(cf => new Date(cf.date) > lvDate)
        subs.forEach(cf => {
          const t = (cf.type || '').toLowerCase()
          const a = Math.abs(Number(cf.amount))
          const n = (cf.notes || cf.description || '').toLowerCase()

          if (t === 'deposit') maxWithdrawable += a
          if (t === 'withdrawal' || t === 'fee' || t === 'tax') maxWithdrawable -= a
          if (t === 'capital_gain' || (t === 'other' && n.includes('capital gain'))) maxWithdrawable += a
          // generic other usually adds
          if (t === 'other' && !n.includes('capital gain')) maxWithdrawable += a
        })
      }

      // 3. Check (Allow small floating point buffer e.g. 0.01)
      // finalAmount for withdrawal is NEGATIVE. The numeric amount from form is 'amount'.
      const requestedAmt = Math.abs(Number(amount))
      if (requestedAmt > (maxWithdrawable + 0.01)) {
        throw new Error(`Insufficient Funds. Available: $${maxWithdrawable.toFixed(2)}, Requested: $${requestedAmt.toFixed(2)}`)
      }
    }



    const { error: insertError } = await supabase.from("cash_flows").insert({
      portfolio_id: finalPortfolio.id,
      date,
      amount: finalAmount,
      type: finalType,
      notes: finalNotes || null,
    })

    if (insertError) {
      console.error("[Server Action] Insert Error:", insertError);
      throw new Error(`Failed to add cash flow: ${insertError.message}`);
    }



    // AUTO-UPDATE VALUATION for Capital Gains AND Withdrawals
    // When we add a Capital Gain or Withdrawal, we want to record the new "Point-in-Time" value.
    if (type === 'capital_gain' || (type === 'other' && finalNotes.includes('Capital Gain')) || type === 'withdrawal' || type === 'deposit') {
      try {
        // 1. Calculate the New Valuation Value at this Date
        // Find latest valuation BEFORE this date
        const { data: prevValuations } = await supabase
          .from("portfolio_values")
          .select("value, date")
          .eq("portfolio_id", finalPortfolio.id)
          .lt("date", date)
          .order("date", { ascending: false })
          .limit(1)

        let baseValue = 0
        let baseDate = new Date(0) // Epoch

        if (prevValuations && prevValuations.length > 0) {
          baseValue = Number(prevValuations[0].value)
          baseDate = new Date(prevValuations[0].date)
        }

        // Sum all flows STRICTLY AFTER baseDate and UP TO (AND INCLUDING) the current date.
        const { data: intervalFlows } = await supabase
          .from("cash_flows")
          .select("*")
          .eq("portfolio_id", finalPortfolio.id)
          .gt("date", baseDate.toISOString())
          .lte("date", date)

        let netFlow = 0
        if (intervalFlows) {
          intervalFlows.forEach(cf => {
            const t = (cf.type || '').toLowerCase()
            const a = Number(cf.amount)
            // DB stores signed values (Deposit +, Withdrawal -).
            netFlow += a
          })
        }

        const calculatedValue = baseValue + netFlow

        // 2. Upsert Valuation for this Date
        const { data: existingVal } = await supabase
          .from("portfolio_values")
          .select("id")
          .eq("portfolio_id", finalPortfolio.id)
          .eq("date", date)
          .maybeSingle()

        if (existingVal) {
          // Update
          await supabase.from("portfolio_values").update({
            value: calculatedValue,
            notes: `Auto-updated: ${finalType} (Revised)`
          }).eq("id", existingVal.id)
        } else {
          // Insert
          await supabase.from("portfolio_values").insert({
            portfolio_id: finalPortfolio.id,
            date: date,
            value: calculatedValue,
            notes: `Auto-created from ${finalType}`
          })
        }

        // 3. Ripple Future Valuations (Roll Forward)
        const { data: futureValuations } = await supabase
          .from("portfolio_values")
          .select("id, value")
          .eq("portfolio_id", finalPortfolio.id)
          .gt("date", date)

        if (futureValuations && futureValuations.length > 0) {
          for (const val of futureValuations) {
            await supabase.from("portfolio_values").update({
              value: Number(val.value) + finalAmount
            }).eq("id", val.id)
          }
        }

      } catch (error) {
        console.error("Auto-valuation error:", error)
      }
    }

    revalidatePath(`/admin/portfolio/${finalPortfolio.id}`)
    redirect(`/admin/portfolio/${finalPortfolio.id}`)
  };


  const handleReinvest = async (formData: FormData) => {
    "use server"
    const supabase = await createClient()
    const amountStr = formData.get("amount") as string


    // Remove currency symbols if present
    const cleanAmount = amountStr.replace(/[^0-9.-]+/g, "")
    const amount = Number(cleanAmount)
    const date = formData.get("date") as string || new Date().toISOString()



    if (!amount || isNaN(amount) || amount <= 0) {
      console.error("[Reinvest] Invalid Amount")
      throw new Error("Invalid amount")
    }

    const { error } = await supabase.from("cash_flows").insert({
      portfolio_id: finalPortfolio.id,
      date: date,
      amount: amount,
      type: "deposit", // SAFE TYPE: Use 'deposit' to satisfy DB constraint, distinguish via notes
      notes: "(Reinvestment) Capitalized Earnings (Profit -> Principal)",
    })

    if (error) {
      console.error("[Reinvest] DB Error:", error)
      throw error
    }

    // AUTO-UPDATE VALUATION for Reinvestment
    try {
      // 1. Find latest valuation BEFORE this date
      const { data: prevValuations } = await supabase
        .from("portfolio_values")
        .select("value, date")
        .eq("portfolio_id", finalPortfolio.id)
        .lt("date", date)
        .order("date", { ascending: false })
        .limit(1)

      let baseValue = 0
      let baseDate = new Date(0) // Epoch

      if (prevValuations && prevValuations.length > 0) {
        baseValue = Number(prevValuations[0].value)
        baseDate = new Date(prevValuations[0].date)
      }

      // 2. Sum regular flows (excluding reinvestments)
      const { data: intervalFlows } = await supabase
        .from("cash_flows")
        .select("*")
        .eq("portfolio_id", finalPortfolio.id)
        .gt("date", baseDate.toISOString())
        .lte("date", date)

      let netFlow = 0
      if (intervalFlows) {
        intervalFlows.forEach(cf => {
          const t = (cf.type || '').toLowerCase()
          const n = (cf.notes || cf.description || '').toLowerCase()
          // Exclude Reinvestments from Value Calculation (Equity Transfer, not new Value)
          if (t === 'reinvestment' ||
            (t === 'other' && n.includes('(reinvestment)')) ||
            (t === 'deposit' && n.includes('(reinvestment)'))
          ) {
            return
          }

          const a = Number(cf.amount)
          netFlow += a
        })
      }

      const calculatedValue = baseValue + netFlow

      // 3. Upsert Valuation
      const { data: existingVal } = await supabase
        .from("portfolio_values")
        .select("id, notes")
        .eq("portfolio_id", finalPortfolio.id)
        .eq("date", date)
        .maybeSingle()

      if (existingVal) {
        // SAFEGUARD: If valuation exists, preserve its Market Value! 
        // We only append a note that a reinvestment occurred.
        // Overwriting it with "Base + Flows" would wipe out the specific market gain entered by the user.
        await supabase.from("portfolio_values").update({
          // value: calculatedValue, // DO NOT OVERWRITE
          notes: existingVal.notes?.includes('Reinvestment') ? existingVal.notes : `${existingVal.notes || ''} (Reinvestment Checkpoint)`
        }).eq("id", existingVal.id)
      } else {
        await supabase.from("portfolio_values").insert({
          portfolio_id: finalPortfolio.id,
          date: date,
          value: calculatedValue,
          notes: `Reinvestment Checkpoint`
        })
      }

    } catch (error) {
      console.error("Auto-valuation error (Reinvest):", error)
    }

    revalidatePath(`/admin/portfolio/${finalPortfolio.id}`)
  }

  const handleUpdateProfile = async (formData: FormData) => {
    "use server"
    const supabase = await createClient()

    const fullName = formData.get("full_name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const startDate = formData.get("start_date") as string
    const initialCapital = formData.get("initial_capital") as string



    // Update user info
    await supabase
      .from("users")
      .update({
        full_name: fullName,
        email: email,
        phone: phone,
      })
      .eq("id", finalPortfolio.investor_id)

    // Update portfolio info
    await supabase
      .from("portfolios")
      .update({
        start_date: startDate || null,
        initial_investment: initialCapital ? Number.parseFloat(initialCapital) : null,
      })
      .eq("id", finalPortfolio.id)

    if (initialCapital && startDate) {
      const amount = Number.parseFloat(initialCapital)

      // Check if there's already an initial deposit cash flow
      const { data: existingCashFlow } = await supabase
        .from("cash_flows")
        .select("*")
        .eq("portfolio_id", finalPortfolio.id)
        .eq("type", "deposit")
        .eq("notes", "Initial investment")
        .single()

      if (existingCashFlow) {
        // Update existing initial deposit
        console.log("[v0] Updating existing initial deposit cash flow")
        await supabase
          .from("cash_flows")
          .update({
            amount: amount,
            date: startDate,
            notes: "Initial investment",
          })
          .eq("id", existingCashFlow.id)
      } else {
        // Create new initial deposit cash flow
        console.log("[v0] Creating new initial deposit cash flow")
        await supabase.from("cash_flows").insert({
          portfolio_id: finalPortfolio.id,
          type: "deposit",
          amount: amount,
          date: startDate,
          notes: "Initial investment",
        })
      }
    }

    redirect(`/admin/portfolio/${finalPortfolio.id}`)
  }

  const handleDeleteValuation = async (formData: FormData) => {
    "use server"
    const supabase = await createClient()
    const id = formData.get("id") as string
    await supabase.from("portfolio_values").delete().eq("id", id)
    redirect(`/admin/portfolio/${finalPortfolio.id}`)
  }

  const handleDeleteCashFlow = async (formData: FormData) => {
    "use server"
    const supabase = await createClient()
    const id = formData.get("id") as string

    // 1. Fetch the cash flow details BEFORE deleting
    const { data: cfToDelete } = await supabase.from("cash_flows").select("*").eq("id", id).single()

    if (cfToDelete) {
      const amount = Number(cfToDelete.amount)
      const date = cfToDelete.date

      // 2. Find associated valuations to revert (Ripple)
      const targetPortfolioId = cfToDelete.portfolio_id

      // Fetch ALL valuations on or after the cash flow date
      const { data: impactedValuations } = await supabase
        .from("portfolio_values")
        .select("*")
        .eq("portfolio_id", targetPortfolioId)
        .gte("date", date)

      if (impactedValuations && impactedValuations.length > 0) {
        console.log(`[Auto-Revert-Ripple] Reverting ${impactedValuations.length} valuations by subtracting ${amount}`)

        for (const val of impactedValuations) {
          await supabase
            .from("portfolio_values")
            .update({ value: Number(val.value) - amount }) // If amount was +10k, we subtract 10k. If -5k, we subtract -5k (+5k). Correct.
            .eq("id", val.id)
        }
      }
    }

    await supabase.from("cash_flows").delete().eq("id", id)
    redirect(`/admin/portfolio/${finalPortfolio.id}`)
  }

  const handleDeleteInvestor = async (formData: FormData) => {
    "use server"
    const supabase = await createClient()
    const portfolioId = formData.get("portfolioId") as string
    const investorId = formData.get("investorId") as string
    const confirmation = formData.get("confirmation") as string

    if (confirmation !== "DELETE") {
      redirect(`/admin/portfolio/${portfolioId}?error=invalid_confirmation`)
    }

    console.log(`[Admin] Attempting full deletion for Investor: ${investorId}, Portfolio: ${portfolioId}`)

    // 1. Delete actual Auth User (Need Service Role Key)
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabaseAdmin = createSupabaseAdmin(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        )
        const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(investorId)
        if (authDeleteError) {
          console.error("[Admin] Failed to delete Auth User:", authDeleteError)
          // Continue to delete data even if auth delete fails (or user already gone)
        } else {
          console.log("[Admin] Successfully deleted Auth User")
        }
      } else {
        console.warn("[Admin] Missing SUPABASE_SERVICE_ROLE_KEY, cannot delete Auth User")
      }
    } catch (err) {
      console.error("[Admin] Error deleting Auth user:", err)
    }

    // 2. Delete Public Data (Values, Flows, Investments, Portfolio, User Profile)
    // Delete in order: portfolio_values, cash_flows, investments, portfolios, user
    const { error: valuesError } = await supabase.from("portfolio_values").delete().eq("portfolio_id", portfolioId)
    const { error: cashFlowsError } = await supabase.from("cash_flows").delete().eq("portfolio_id", portfolioId)
    const { error: investmentsError } = await supabase.from("investments").delete().eq("portfolio_id", portfolioId)
    const { error: portfolioError } = await supabase.from("portfolios").delete().eq("id", portfolioId)
    const { error: userError } = await supabase.from("users").delete().eq("id", investorId)

    if (valuesError || cashFlowsError || investmentsError || portfolioError || userError) {
      console.error("[Admin] Data deletion errors:", { valuesError, cashFlowsError, investmentsError, portfolioError, userError })
      redirect(`/admin/portfolio/${portfolioId}?error=delete_failed`)
    }

    redirect("/admin?success=investor_deleted")
  }

  // Use the correct action name `updateInvestorProfile` and pass necessary arguments
  const updateInvestorProfile = async (formData: FormData) => {
    "use server"
    const supabase = await createClient()

    const portfolioId = formData.get("portfolioId") as string
    const investorId = formData.get("investorId") as string
    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const startDate = formData.get("startDate") as string
    const initialCapital = formData.get("initialCapital") as string

    console.log("[v0] Updating investor profile with data:", {
      portfolioId,
      investorId,
      fullName,
      email,
      phone,
      startDate,
      initialCapital,
    })

    // Update user info
    await supabase
      .from("users")
      .update({
        full_name: fullName,
        email: email,
        phone: phone,
      })
      .eq("id", investorId)

    // Update portfolio info
    await supabase
      .from("portfolios")
      .update({
        start_date: startDate || null,
        initial_investment: initialCapital ? Number.parseFloat(initialCapital) : null,
      })
      .eq("id", portfolioId)

    if (initialCapital && startDate) {
      const amount = Number.parseFloat(initialCapital)

      // Check if there's already an initial deposit cash flow
      const { data: existingCashFlow } = await supabase
        .from("cash_flows")
        .select("*")
        .eq("portfolio_id", portfolioId)
        .eq("type", "deposit")
        .eq("notes", "Initial investment")
        .single()

      if (existingCashFlow) {
        // Update existing initial deposit
        console.log("[v0] Updating existing initial deposit cash flow")
        await supabase
          .from("cash_flows")
          .update({
            amount: amount,
            date: startDate,
            notes: "Initial investment",
          })
          .eq("id", existingCashFlow.id)
      } else {
        // Create new initial deposit cash flow

        await supabase.from("cash_flows").insert({
          portfolio_id: portfolioId,
          type: "deposit",
          amount: amount,
          date: startDate,
          notes: "Initial investment",
        })
      }

      // Sync Portfolio Value for Initial Investment
      const { data: existingValuation } = await supabase
        .from("portfolio_values")
        .select("*")
        .eq("portfolio_id", portfolioId)
        .eq("date", startDate)
        .maybeSingle()

      if (existingValuation) {

        await supabase
          .from("portfolio_values")
          .update({
            value: amount,
            notes: "Initial valuation",
          })
          .eq("id", existingValuation.id)
      } else {

        await supabase.from("portfolio_values").insert({
          portfolio_id: portfolioId,
          date: startDate,
          value: amount,
          notes: "Initial valuation",
        })
      }
    }

    redirect(`/admin/portfolio/${portfolioId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:p-16 space-y-8 md:space-y-20">
        {/* Warning Messages */}
        {warnings.length > 0 && (
          <div className="space-y-4">
            {warnings.map((warning, index) => (
              <Alert key={index} variant="default" className="border-amber-500/50 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-500">
                  <strong>{warning.type}:</strong> {warning.message}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Portfolio Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Link href="/">
              <h1 className="text-3xl font-bold tracking-tight cursor-pointer hover:text-primary transition-colors">
                {finalPortfolio?.users?.full_name || "Investor"} Portfolio
              </h1>
            </Link>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">Portfolio ID: {finalPortfolio?.id}</p>

              {/* CURRENT VALUE DISPLAY */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-400">
                  Current Value: {formatCurrency(currentValue)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300">
              <Link href={`/investor?viewAs=${finalPortfolio.investor_id}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                View as Investor
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Admin
              </Link>
            </Button>
          </div>
        </div>

        {/* METRICS SECTION - Admin View */}
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            {/* 1. Net Invested Capital */}
            <div className="rounded-xl border border-white/5 bg-slate-900/50 p-4 flex justify-between items-center">
              <span className="text-slate-400">Net Invested Capital</span>
              <span className="text-white font-bold text-lg">
                {formatCurrency(lifetimeMetrics.netContributions, true)}
              </span>
            </div>

            {/* 2. Current Value */}
            <div className="rounded-xl border border-white/5 bg-slate-900/50 p-4 flex justify-between items-center">
              <span className="text-slate-400">Current value</span>
              <span className="text-white font-bold text-lg">{formatCurrency(currentValue, true)}</span>
            </div>

            {/* 3. Total Gain/Loss with Dropdown */}
            <div className="rounded-xl border border-white/5 bg-slate-900/50 p-4 flex justify-between items-center relative group">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Total Gain/Loss</span>
                    <div className="group relative">
                      <Info className="h-3 w-3 text-slate-600 cursor-help" />
                      <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 hidden group-hover:block w-48 p-2 bg-slate-800 text-xs text-slate-200 rounded-lg shadow-xl border border-slate-700 z-50 leading-relaxed text-center">
                        Net Profit / Net Invested Capital.
                      </div>
                    </div>
                  </div>
                  <AdminPeriodSelector portfolioId={finalPortfolio.id} currentPeriod={period} />
                </div>
              </div>
              <div className="text-right">
                <span className={`font-bold text-lg block ${Number(periodPnL) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {Number(periodPnL) >= 0 ? "+" : ""}
                  {formatCurrency(periodPnL, true)}
                </span>
                <span className="text-xs text-slate-500 font-mono opacity-80">
                  {periodReturn >= 0 ? "+" : ""}{periodReturn.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* 4. Nidhiksh Performance (Full Width) */}
            <div className="col-span-1 md:col-span-3 rounded-xl border border-white/10 bg-slate-950/30 p-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Nidhiksh Performance</span>
                <div className="group relative">
                  <Info className="h-4 w-4 text-slate-600 cursor-help" />
                  <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 hidden group-hover:block w-64 p-3 bg-slate-800 text-xs text-slate-200 rounded-lg shadow-xl border border-slate-700 z-50 leading-relaxed">
                    <p className="font-semibold text-white mb-1">Nidhiksh Performance</p>
                    Shows the cumulative return on Net Invested Capital. (Simple Return: Total Gain / Total Capital Injected)
                  </div>
                </div>
              </div>
              <span
                className={`text-sm font-semibold ${nidhikshPerformance >= 0 ? "text-emerald-500" : "text-red-500"}`}
              >
                {formatPercentage(nidhikshPerformance)}
              </span>
            </div>
          </div>
        </div>

        {/* Capitalize Earnings Card */}
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-500" />
              <CardTitle>Capitalize Earnings</CardTitle>
            </div>
            <CardDescription>
              Convert accumulated profit into Invested Capital (Principal).
              This increases the basis for future return calculations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-slate-900/50 p-3">
                <div className="text-xs text-slate-400">Current Value</div>
                <div className="font-mono text-lg font-bold text-white">
                  {formatCurrency(lifetimeMetrics.currentValue)}
                </div>
              </div>
              <div className="rounded-lg bg-slate-900/50 p-3">
                <div className="text-xs text-slate-400">Net Invested</div>
                <div className="font-mono text-lg font-bold text-slate-300">
                  {formatCurrency(lifetimeMetrics.netContributions)}
                </div>
              </div>
              <div className="rounded-lg bg-slate-900/50 p-3">
                <div className="text-xs text-slate-400">Unrealized Gain</div>
                <div className="font-mono text-lg font-bold text-emerald-400">
                  {formatCurrency(Math.max(0, lifetimeMetrics.unrealizedPnL || 0))}
                </div>
              </div>
            </div>

            <form action={handleReinvest} className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <Label>Amount to Capitalize</Label>
                <Input
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  max={Math.max(0, lifetimeMetrics.unrealizedPnL || 0).toFixed(2)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Effective Date</Label>
                <ClickableDateInput
                  name="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <Button type="submit" variant="default" className="bg-amber-600 hover:bg-amber-700">
                Convert to Principal
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Investor Profile - Full Width */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Investor Profile</CardTitle>
            </div>
            <CardDescription>Complete investor information</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateInvestorProfile} className="space-y-6">
              <input type="hidden" name="portfolioId" value={finalPortfolio?.id || ""} />
              <input
                type="hidden"
                name="investorId"
                value={finalPortfolio?.investor_id || finalPortfolio?.users?.id || ""}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-amber-600" />
                    FULL NAME
                  </Label>
                  <Input id="fullName" name="fullName" defaultValue={finalPortfolio?.users?.full_name || ""} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    EMAIL
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={finalPortfolio?.users?.email || ""}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-600" />
                    PHONE
                  </Label>
                  <Input id="phone" name="phone" defaultValue={finalPortfolio?.users?.phone || ""} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    INVESTMENT START DATE
                  </Label>
                  <ClickableDateInput id="startDate" name="startDate" defaultValue={finalPortfolio?.start_date || ""} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initialCapital" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-amber-600" />
                    INITIAL CAPITAL
                  </Label>
                  <Input
                    id="initialCapital"
                    name="initialCapital"
                    type="number"
                    step="0.01"
                    defaultValue={finalPortfolio?.initial_investment || 0}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    ACCOUNT CREATED
                  </Label>
                  <div className="text-lg font-semibold">
                    {finalPortfolio?.users?.created_at
                      ? new Date(finalPortfolio.users.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                      : "Not available"}
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full md:w-auto">
                <Pencil className="mr-2 h-4 w-4" />
                Update Investor Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Portfolio Valuations Table */}
        <Card className="border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Portfolio Valuations</CardTitle>
            <CardDescription className="text-slate-400">Historical portfolio value snapshots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-zinc-700 overflow-hidden overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow className="border-zinc-700 bg-zinc-900/50">
                    <TableHead className="text-slate-300">Date</TableHead>
                    <TableHead className="text-slate-300">Portfolio Value</TableHead>
                    <TableHead className="text-slate-300">Notes</TableHead>
                    <TableHead className="text-slate-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolioValues && portfolioValues.length > 0 ? (
                    portfolioValues.map((pv) => (
                      <TableRow key={pv.id} className="border-zinc-700">
                        <TableCell className="text-white">
                          {new Date(pv.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="font-mono text-amber-400">
                          ${Number(pv.value).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-slate-400">{pv.notes || "-"}</TableCell>
                        <TableCell className="text-right">
                          <form action={handleDeleteValuation} className="inline">
                            <input type="hidden" name="id" value={pv.id} />
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-slate-400 py-8">
                        No portfolio valuations recorded yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Cash Flows Table */}
        <Card className="border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Cash Flows</CardTitle>
            <CardDescription className="text-slate-400">
              Deposits, withdrawals, and other cash movements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-zinc-700 overflow-hidden overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow className="border-zinc-700 bg-zinc-900/50">
                    <TableHead className="text-slate-300">Date</TableHead>
                    <TableHead className="text-slate-300">Type</TableHead>
                    <TableHead className="text-slate-300">Amount</TableHead>
                    <TableHead className="text-slate-300">Notes</TableHead>
                    <TableHead className="text-slate-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashFlows && cashFlows.length > 0 ? (
                    cashFlows.map((cf) => (
                      <TableRow key={cf.id} className="border-zinc-700">
                        <TableCell className="text-white">
                          {new Date(cf.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-amber-500/10 text-amber-400 capitalize">
                            {cf.type}
                          </span>
                        </TableCell>
                        <TableCell
                          className={`font-mono ${Number(cf.amount) >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {Number(cf.amount) >= 0 ? "+" : ""}$
                          {Number(cf.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-slate-400">{cf.notes || "-"}</TableCell>
                        <TableCell className="text-right">
                          <form action={handleDeleteCashFlow} className="inline">
                            <input type="hidden" name="id" value={cf.id} />
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                        No cash flows recorded yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Upload - Full Width */}
        <BulkUpload portfolioId={finalPortfolio.id} />

        {/* Add Portfolio Valuation and Add Cash Flow forms */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Add Portfolio Valuation */}
          <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5 text-amber-400" />
                Add Portfolio Valuation
              </CardTitle>
              <CardDescription className="text-slate-400">Record end-of-day portfolio value</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleAddValuation} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="valuation_date" className="text-slate-200">
                    Date *
                  </Label>
                  <ClickableDateInput
                    id="valuation_date"
                    name="valuation_date"
                    required
                    className="border-zinc-700 bg-zinc-900/50 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valuation_value" className="text-slate-200">
                    Portfolio Value (USD) *
                  </Label>
                  <Input
                    id="valuation_value"
                    name="valuation_value"
                    type="number"
                    step="0.01"
                    placeholder="100000.00"
                    required
                    className="border-zinc-700 bg-zinc-900/50 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valuation_notes" className="text-slate-200">
                    Notes (Optional)
                  </Label>
                  <Input
                    id="valuation_notes"
                    name="valuation_notes"
                    placeholder="Any notes about this valuation..."
                    className="border-zinc-700 bg-zinc-900/50 text-white"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Valuation
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Add Cash Flow */}
          <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <DollarSign className="h-5 w-5 text-amber-400" />
                Add Cash Flow
              </CardTitle>
              <CardDescription className="text-slate-400">Record deposits, withdrawals, fees, etc.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleAddCashFlow} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cf_date" className="text-slate-200">
                    Date *
                  </Label>
                  <ClickableDateInput
                    id="cf_date"
                    name="cf_date"
                    required
                    className="border-zinc-700 bg-zinc-900/50 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cf_type" className="text-slate-200">
                    Type *
                  </Label>
                  <Select name="cf_type" required>
                    <SelectTrigger className="border-zinc-700 bg-zinc-900/50 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-700 bg-zinc-900">
                      <SelectItem value="deposit">Deposit (Money In)</SelectItem>
                      <SelectItem value="withdrawal">Withdrawal (Money Out)</SelectItem>
                      <SelectItem value="capital_gain">Capital Gain</SelectItem>
                      <SelectItem value="fee">Fee</SelectItem>
                      <SelectItem value="tax">Tax</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cf_amount" className="text-slate-200">
                    Amount (USD) *
                  </Label>
                  <Input
                    id="cf_amount"
                    name="cf_amount"
                    type="number"
                    step="0.01"
                    placeholder="10000.00"
                    required
                    className="border-zinc-700 bg-zinc-900/50 text-white"
                  />
                  <p className="text-xs text-slate-500">Enter positive amount (sign handled automatically)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cf_notes" className="text-slate-200">
                    Notes (Optional)
                  </Label>
                  <Input
                    id="cf_notes"
                    name="cf_notes"
                    placeholder="Any notes about this cash flow..."
                    className="border-zinc-700 bg-zinc-900/50 text-white"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Cash Flow
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone section */}
        <Card className="border-red-500/20 bg-gradient-to-br from-red-950/30 to-slate-900/50 backdrop-blur-xl mt-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-400">Danger Zone</CardTitle>
            <CardDescription className="text-slate-400">
              Permanently delete this investor and all associated data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-4">
                <h4 className="mb-2 font-semibold text-red-400">This action cannot be undone</h4>
                <p className="text-sm text-slate-300">Deleting this investor will permanently remove:</p>
                <ul className="ml-6 mt-2 list-disc space-y-1 text-sm text-slate-400">
                  <li>Investor account and profile information</li>
                  <li>Portfolio data and investment history</li>
                  <li>All portfolio valuations ({portfolioValues?.length || 0} records)</li>
                  <li>All cash flow transactions ({cashFlows?.length || 0} records)</li>
                  <li>Performance calculations and historical data</li>
                </ul>
              </div>

              <form action={handleDeleteInvestor} className="space-y-4">
                <input type="hidden" name="portfolioId" value={finalPortfolio.id} />
                <input type="hidden" name="investorId" value={finalPortfolio.investor_id} />

                <div className="space-y-2">
                  <label htmlFor="confirmation" className="text-sm font-medium text-slate-300">
                    Type <span className="font-mono text-red-400">DELETE</span> to confirm
                  </label>
                  <Input
                    id="confirmation"
                    name="confirmation"
                    type="text"
                    placeholder="DELETE"
                    className="w-full rounded-lg border border-red-500/30 bg-slate-950/50 px-4 py-2 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="destructive"
                  size="lg"
                  className="w-full gap-2 bg-red-600 font-semibold hover:bg-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                  Delete Investor Permanently
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}

