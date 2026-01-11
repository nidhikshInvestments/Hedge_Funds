import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import {
  calculateMonthlyPerformanceV2,
  calculatePortfolioMetrics,
  calculateTWR,
  prepareChartData,
  type Valuation,
  type CashFlow,
} from "@/lib/portfolio-calculations-v2"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import PortfolioChart from "@/components/portfolio-chart"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Info, ArrowRight } from "lucide-react"
import Image from "next/image"
import { LogoutButton, PeriodSelector } from "./client-wrapper"
import Link from "next/link"
import { DashboardFooter } from "@/components/dashboard-footer"

type Props = {
  searchParams: Promise<{ period?: string }>
}

export const dynamic = "force-dynamic"

function filterDataByPeriod(
  valuations: Valuation[],
  cashFlows: CashFlow[],
  period: "ytd" | "monthly" | "yearly" | "all",
): { filteredValuations: Valuation[]; filteredCashFlows: CashFlow[] } {
  const now = new Date()
  let startDate: Date | null = null

  switch (period) {
    case "monthly":
      // Current month only
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case "ytd":
      // Year to date
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    case "yearly":
      // Last 12 months
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      break
    case "all":
      // All time - no filtering
      return { filteredValuations: valuations, filteredCashFlows: cashFlows }
  }

  if (!startDate) {
    return { filteredValuations: valuations, filteredCashFlows: cashFlows }
  }

  // Sort valuations by date
  const sortedValuations = [...valuations].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Find the last valuation before the period start (baseline)
  const baselineValuation = sortedValuations.filter((v) => new Date(v.date) < startDate!).slice(-1)[0]

  // Get valuations within the period
  const filteredValuations = sortedValuations.filter((v) => new Date(v.date) >= startDate!)

  // Include baseline valuation if it exists (needed for accurate start value)
  if (baselineValuation && filteredValuations.length > 0) {
    filteredValuations.unshift(baselineValuation)
  }

  // Get cash flows within the period
  const filteredCashFlows = cashFlows.filter((cf) => new Date(cf.date) >= startDate!)

  return { filteredValuations, filteredCashFlows }
}

export default async function InvestorDashboard({ searchParams }: Props) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { period: periodParam } = await searchParams
  const period = (periodParam as "ytd" | "monthly" | "yearly" | "all") || "ytd"

  const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!userData?.profile_completed || !userData.full_name || !userData.phone) {
    redirect("/complete-profile")
  }

  const { data: companyInfo } = await supabase.from("company_info").select("*").single() // 2. Get Portfolio
  const { data: portfolios, error: portfolioError } = await supabase
    .from("portfolios")
    .select("*")
    .eq("investor_id", user.id)

  if (portfolioError) {
    console.error("Error fetching portfolios:", portfolioError)
  }

  const portfolio = portfolios?.[0]

  if (!portfolio) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">No Portfolio Found</h1>
        <p className="text-muted-foreground">
          Contact your administrator to have a portfolio assigned to your account.
        </p>
      </div>
    )
  }

  console.log("Active Portfolio:", { id: portfolio.id, name: portfolio.portfolio_name })

  // 3. Get Data (Valuations & Cash Flows)
  const { data: valuations, error: valError } = await supabase
    .from("portfolio_values")
    .select("*")
    .eq("portfolio_id", portfolio.id)
    .order("date", { ascending: true })
    .order("created_at", { ascending: true })

  if (valError) console.error("Error fetching valuations:", valError)

  const { data: cashFlows, error: cfError } = await supabase
    .from("cash_flows")
    .select("*")
    .eq("portfolio_id", portfolio.id)
    .order("date", { ascending: true })

  if (cfError) console.error("Error fetching cash flows:", cfError)

  console.log("Fetched Data:", {
    valuationsCount: valuations?.length || 0,
    cashFlowsCount: cashFlows?.length || 0,
    valuationsSample: valuations?.map((v) => ({ d: v.date, v: v.value, c: v.created_at })).slice(-5), // Check the last 5 (newest by query order? Or oldest?)
  })

  const { filteredValuations, filteredCashFlows } = filterDataByPeriod(valuations || [], cashFlows || [], period)

  const sortedValuations = filteredValuations.sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
    if (dateDiff !== 0) return dateDiff
    // Tie-breaker: Newest created_at first (Descending)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  // Explicitly sort the raw valuations to guarantee order before picking the latest
  // (Trusting DB sort might be risky if dates are strings or mixed formats)
  const allValuationsSorted = [...(valuations || [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  const globalLatestValuation =
    allValuationsSorted.length > 0 ? allValuationsSorted[allValuationsSorted.length - 1] : null
  const currentValue = globalLatestValuation ? globalLatestValuation.value : 0

  console.log("DEBUG: Current Value Calculation", {
    rawValuationsCount: valuations?.length,
    sortedLastDate: globalLatestValuation?.date,
    sortedLastValue: globalLatestValuation?.value,
    currentValue,
  })

  // 1. Lifetime Metrics (for "Net Contribution" / "Invested" card)
  // We use ALL cash flows to show total capital deployed since inception.
  const lifetimeMetrics = calculatePortfolioMetrics(currentValue, cashFlows || [], valuations || [])
  console.log("Dashboard Metrics:", JSON.stringify(lifetimeMetrics, null, 2))

  // 2. Period Metrics (for "Total Gain/Loss" and "Return" card)
  // We use filtered flows & valuations to get P&L for the specific period (YTD, Monthly, etc.)
  // 3. Period Metrics (PnL) - PASS VALUATIONS to trigger V2 Logic (End Principal)
  const periodMetrics = calculatePortfolioMetrics(currentValue, filteredCashFlows, filteredValuations)

  const twr = calculateTWR(filteredValuations, filteredCashFlows)
  // If TWR is available, use it (Time-Weighted). Otherwise fallback to simple return (e.g. for short periods or missing val history)
  const periodReturn = twr !== null ? twr : periodMetrics.simpleReturnPct || 0

  const chartData = prepareChartData(filteredValuations, filteredCashFlows)
  // Use RAW data for Monthly Breakdown to ensure full history is available for logic
  // (We can filter the result list later if needed, but the calc engine needs context)
  const monthlyPerformance = calculateMonthlyPerformanceV2(valuations || [], cashFlows || [])

  // Calculate Period P&L explicitly: End - Start - NetFlow
  let periodPnL = 0

  if (period === "all") {
    // For ALL time, Start Value is effectively 0 (relative to flows).
    // So Lifetime P&L = Current - LifetimeNetInvested
    periodPnL = lifetimeMetrics.totalPnL
  } else {
    // For specific periods (YTD, Monthly), we check if we have a valid baseline.
    // If the oldest valuation is OLDER than the period start, it's a baseline.
    // Otherwise, the portfolio started DURING the period, so Start Value is 0.

    // We need to re-derive the start date to check this condition
    // (Ideally, filterDataByPeriod would return this, but we'll recalculate for now to remain safe)
    const now = new Date()
    let startDate: Date | null = null
    switch (period) {
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case "ytd":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case "yearly":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
    }

    if (sortedValuations.length > 0 && startDate) {
      const oldestValuation = sortedValuations[sortedValuations.length - 1]
      // Is the oldest valuation a baseline (from before the period)?
      const isBaseline = new Date(oldestValuation.date).getTime() < startDate.getTime()

      const startValue = isBaseline ? oldestValuation.value : 0
      const netFlowPeriod = periodMetrics.netContributions

      periodPnL = currentValue - startValue - netFlowPeriod
    } else {
      // No valuations? PnL is effectively 0 (or just based on flows if we tracked that, but usually 0)
      periodPnL = periodMetrics.totalPnL
    }
  }

  // Calculate Generic Simple ROI (Cash on Cash) used for "Total Gain/Loss" displays
  const roiDenominator = lifetimeMetrics.netContributions || 1
  const rawSimpleRoi = (periodPnL / roiDenominator) * 100

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-950 to-slate-950">
      <div className="absolute inset-0 bg-black">
        <div className="absolute left-1/4 top-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-600/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-600/20 blur-3xl animation-delay-2000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
        <div className="container mx-auto flex h-20 items-center justify-between">
          <Link href="/" className="group flex items-center gap-3 cursor-pointer">
            <div className="relative h-14 w-14 rounded-xl overflow-hidden">
              <Image
                src="/images/nidhiksh-logo.jpg"
                alt="Nidhiksh Investments Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-xl md:text-2xl font-bold tracking-tight text-transparent">
              Nidhiksh Investments
            </span>
          </Link>
          <LogoutButton />
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="relative z-10 container mx-auto py-6 md:py-10">
        <div className="mb-6 md:mb-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">Investment Dashboard</h1>
              <p className="mt-2 text-sm md:text-lg text-slate-400">
                Welcome back, {userData?.full_name || "Investor"}. Monitor your investment growth and{" "}
                <span className="text-blue-400">performance</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-10 space-y-6">
          {/* Hero Card */}
          <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl shadow-lg shadow-amber-500/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-400">
                Total Gain/Loss
              </CardTitle>
              <PeriodSelector currentPeriod={period} />
            </CardHeader>
            <CardContent>
              <div
                className={`text-4xl md:text-5xl font-bold break-words ${periodPnL >= 0 ? "text-emerald-400" : "text-red-400"}`}
              >
                {periodPnL >= 0 ? "+" : "-"}
                {formatCurrency(Math.abs(periodPnL), true)}
              </div>
              <p className="mt-2 text-lg text-slate-400 font-medium">
                ({(() => {
                  return lifetimeMetrics.netContributions > 0 ? (rawSimpleRoi > 0 ? "+" : "") + rawSimpleRoi.toFixed(2) : "—"
                })()}%)
              </p>
            </CardContent>
          </Card>

          {/* Detail Rows */}
          {/* Detail Rows */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/5 bg-slate-900/50 p-4 flex justify-between items-center">
              <span className="text-slate-400">Total Net Invested</span>
              <span className="text-white font-bold text-lg">
                {formatCurrency(lifetimeMetrics.netContributions, true)}
              </span>
            </div>
            <div className="rounded-xl border border-white/5 bg-slate-900/50 p-4 flex justify-between items-center">
              <span className="text-slate-400">Current value</span>
              <span className="text-white font-bold text-lg">{formatCurrency(lifetimeMetrics.currentValue, true)}</span>
            </div>

          </div>

          {/* Collapsible Strategy Performance */}
          <div className="rounded-xl border border-white/10 bg-slate-950/30 p-3 flex justify-between items-center">
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
            <span className={`text-sm font-semibold ${periodReturn >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {periodReturn > 0 ? "+" : ""}
              {periodReturn.toFixed(2)}%
            </span>
          </div>
        </div>

        <Card className="mb-10 border-2 border-amber-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl shadow-lg shadow-amber-500/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold text-white">Portfolio Growth Over Time</CardTitle>
                <CardDescription className="text-base text-slate-400">
                  Track your investment from starting funds to current value
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-8">
            <PortfolioChart data={chartData} />
          </CardContent>
        </Card>

        {monthlyPerformance.length > 0 && (
          <Card className="mb-10 border-2 border-amber-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl shadow-lg shadow-amber-500/10">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-white">Monthly Performance Breakdown</CardTitle>
              <CardDescription className="text-base text-slate-400">
                Period returns with cash flow tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="md:hidden flex items-center justify-end gap-1 mb-2 text-xs text-slate-500">
                <span>Swipe to view full details</span>
                <ArrowRight className="h-3 w-3 animate-pulse" />
              </div>
              <div className="relative overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableHead className="text-slate-300">Month</TableHead>
                      <TableHead className="text-right text-slate-300">Start Value</TableHead>
                      <TableHead className="text-right text-slate-300">Net Flow</TableHead>
                      <TableHead className="text-right text-slate-300">End Value</TableHead>
                      <TableHead className="text-right text-slate-300">Monthly P&L</TableHead>
                      <TableHead className="text-right text-slate-300">Monthly Return</TableHead>
                      <TableHead className="text-right text-slate-300">
                        <div className="flex items-center justify-end gap-1">
                          Cumulative Return
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <Info className="h-3 w-3 text-slate-500 cursor-help" />
                            </HoverCardTrigger>
                            <HoverCardContent className="w-64 bg-slate-800 border-slate-700 text-slate-200 text-xs p-3">
                              <p className="font-semibold text-white mb-1">Cumulative Return</p>
                              Based on Simple Return. (Total Gain / Net Invested Capital).
                              <br />Reinvested profits are NOT treated as new capital (Annual Basis).
                            </HoverCardContent>
                          </HoverCard>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyPerformance.map((row, index) => (
                      <TableRow key={index} className="border-white/10 hover:bg-white/5">
                        <TableCell className="font-medium text-white">
                          <div className="flex items-center gap-2">
                            {row.periodLabel}
                            {/* Check for Ongoing status */}
                            {row.isOngoing && (
                              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase font-bold text-amber-500 border border-amber-500/20">
                                Ongoing
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-white">
                          {formatCurrency(row.startValue)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${row.netFlow > 0 ? "text-blue-400" : row.netFlow < 0 ? "text-red-400" : "text-slate-400"}`}
                        >
                          {row.netFlow > 0 ? "+" : ""}
                          {formatCurrency(row.netFlow)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-white">
                          {formatCurrency(row.endValue)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${row.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}
                        >
                          {row.pnl >= 0 ? "+" : ""}
                          {formatCurrency(row.pnl)}
                        </TableCell>
                        <TableCell
                          className={`text-right text-lg font-bold ${row.returnPct >= 0 ? "text-emerald-400" : "text-red-400"}`}
                        >
                          {row.returnPct > 0 ? "+" : ""}
                          {row.returnPct.toFixed(Math.abs(row.returnPct) < 1 ? 4 : 2)}%
                        </TableCell>
                        <TableCell
                          className={`text-right text-lg font-bold ${row.cumulativeReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}
                        >
                          {row.cumulativeReturn > 0 ? "+" : ""}
                          {row.cumulativeReturn.toFixed(Math.abs(row.cumulativeReturn) < 1 ? 4 : 2)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>

          </Card>
        )}

        {/* Disclaimer */}
        <div className="mt-8 px-4 text-center">
          <p className="mx-auto max-w-4xl text-xs text-slate-500 italic leading-relaxed opacity-70">
            Disclaimer: Thank you for your continued trust in Nidhiksh Investments. Please note that occasional technical
            discrepancies may result in incomplete or inaccurate data. For the most accurate and up‑to‑date information,
            kindly verify all details directly with Nidhiksh Investments.
          </p>
        </div>

        {(!portfolios || portfolios.length === 0) && (
          <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl shadow-lg shadow-amber-500/10">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20">
                <ArrowRight className="h-12 w-12 text-amber-400" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-white">Portfolio Setup In Progress</h3>
              <p className="max-w-md text-center text-slate-400">
                Your portfolio administrator is setting up your account. You will receive an email notification once
                your portfolio data is available.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <DashboardFooter />
    </div>
  )
}
