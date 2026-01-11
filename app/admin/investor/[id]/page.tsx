import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import PortfolioChart from "@/components/portfolio-chart"
import ManageInvestorForm from "@/components/manage-investor-form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import Image from "next/image"
import { calculateTWR, calculatePortfolioMetrics, CashFlow, Valuation } from "@/lib/portfolio-calculations"

export default async function InvestorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get admin data
  const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (userData?.role !== "admin") {
    redirect("/investor")
  }

  // Get investor data
  const { data: investor } = await supabase.from("users").select("*").eq("id", id).single()

  if (!investor) {
    redirect("/admin")
  }

  // Get investor's portfolios
  const { data: portfolios } = await supabase.from("portfolios").select("*").eq("investor_id", id)

  // Get all portfolio values
  const portfolioIds = portfolios?.map((p) => p.id) || []
  const { data: portfolioValues } = await supabase
    .from("portfolio_values")
    .select("*")
    .in("portfolio_id", portfolioIds)
    .order("date", { ascending: true })

  // Get cash flows
  const { data: cashFlowsData } = await supabase
    .from("cash_flows")
    .select("*")
    .in("portfolio_id", portfolioIds)
    .order("date", { ascending: true })

  // Calculate stats
  const latestValue = portfolioValues?.slice(-1)[0]
  const firstValue = portfolioValues?.[0]
  let currentValue = latestValue ? Number(latestValue.value) : 0

  // Adjust Current Value: Add 'capital_gain' flows occurring AFTER the last valuation
  if (latestValue) {
    const lastValDate = new Date(latestValue.date)
    const subsequentGains = (cashFlowsData || [])
      .filter((cf: any) => cf.type === 'capital_gain' && new Date(cf.date) > lastValDate)
      .reduce((sum: number, cf: any) => sum + Math.abs(Number(cf.amount)), 0)

    currentValue += subsequentGains
  }

  const initialValue = firstValue ? Number(firstValue.value) : 0
  const totalGain = currentValue - initialValue
  const percentageGain = initialValue > 0 ? ((totalGain / initialValue) * 100).toFixed(2) : "0.00"

  // Calculate Nidhiksh Performance (Time Weighted Return)
  const mappedValuations: Valuation[] = (portfolioValues || []).map((pv: any) => ({
    id: pv.id,
    portfolio_id: pv.portfolio_id,
    date: pv.date,
    value: Number(pv.value),
    created_at: pv.created_at,
  }))

  const mappedCashFlows: CashFlow[] = (cashFlowsData || []).map((cf: any) => ({
    date: cf.date,
    amount: Number(cf.amount),
    type: cf.type,
    portfolio_id: cf.portfolio_id,
  }))

  const twr = calculateTWR(mappedValuations, mappedCashFlows)
  const nidhikshPerformance = twr !== null ? twr : 0

  // Calculate Net Invested Capital using the helper
  const metrics = calculatePortfolioMetrics(currentValue, mappedCashFlows, mappedValuations)
  const netInvestedCapital = metrics.netContributions

  // Determine Time Period for Gain/Loss
  // Use the date of the first cash flow or valuation, whichever is earlier
  let timePeriodLabel = "Since Inception"
  if (mappedCashFlows.length > 0 || mappedValuations.length > 0) {
    const dates = [
      ...mappedCashFlows.map(c => new Date(c.date).getTime()),
      ...mappedValuations.map(v => new Date(v.date).getTime())
    ].filter(t => !isNaN(t))

    if (dates.length > 0) {
      const minDate = new Date(Math.min(...dates))
      timePeriodLabel = `Since ${minDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    }
  }

  const plData =
    portfolioValues?.map((value, index) => {
      const previousValue = index > 0 ? portfolioValues[index - 1] : null
      const currentVal = Number(value.value)
      const previousVal = previousValue ? Number(previousValue.value) : Number(value.value)
      const periodGain = currentVal - previousVal
      const periodReturn = previousVal > 0 ? ((periodGain / previousVal) * 100).toFixed(2) : "0.00"
      const totalGainFromStart = currentVal - initialValue
      const totalReturnFromStart = initialValue > 0 ? ((totalGainFromStart / initialValue) * 100).toFixed(2) : "0.00"

      return {
        date: value.date,
        value: currentVal,
        periodGain,
        periodReturn,
        totalGain: totalGainFromStart,
        totalReturn: totalReturnFromStart,
      }
    }) || []

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute left-0 top-0 h-96 w-96 animate-pulse rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 animate-pulse rounded-full bg-yellow-500/10 blur-3xl animation-delay-2000" />
      </div>

      {/* Navigation */}
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

      {/* Investor Detail Content */}
      <div className="relative z-10 container py-10">
        <div className="mb-8">
          <h1 className="text-5xl font-bold tracking-tight text-white">{investor.full_name || "Unnamed Investor"}</h1>
          <p className="mt-2 text-lg text-slate-400">{investor.email}</p>
        </div>

        {/* Stats Cards */}
        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 grid-cols-1 md:grid-cols-3">
          {/* 1. Net Invested Capital */}
          <Card className="border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-400">
                Net Invested Capital
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white break-words">
                {formatCurrency(netInvestedCapital, true)}
              </div>
            </CardContent>
          </Card>

          {/* 2. Current Value */}
          <Card className="border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-400">
                Current Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white break-words">{formatCurrency(currentValue, true)}</div>
            </CardContent>
          </Card>

          {/* 3. Total Gain/Loss */}
          <Card className="border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-400">
                Total Gain/Loss
              </CardTitle>
              <span className="text-xs text-slate-500 font-mono">{timePeriodLabel}</span>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold break-words ${totalGain >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {totalGain >= 0 ? "+" : "-"}
                {formatCurrency(Math.abs(totalGain), true)}
              </div>
            </CardContent>
          </Card>

          {/* 4. Nidhiksh Performance (Full Width) */}
          <Card className="col-span-1 md:col-span-3 border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-400">
                Nidhiksh Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-3xl font-bold break-words ${nidhikshPerformance >= 0 ? "text-emerald-400" : "text-red-400"}`}
              >
                {formatPercentage(nidhikshPerformance)}
              </div>
            </CardContent>
          </Card>
        </div >

        {/* Portfolio Chart */}
        {
          portfolioValues && portfolioValues.length > 0 && (
            <Card className="mb-8 border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">Portfolio Performance</CardTitle>
                <CardDescription className="text-slate-400">Historical performance data over time</CardDescription>
              </CardHeader>
              <CardContent>
                <PortfolioChart data={portfolioValues} />
              </CardContent>
            </Card>
          )
        }

        {/* Date-wise P&L Analysis Table */}
        {
          plData.length > 0 && (
            <Card className="mb-8 border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">Date-wise P&L Analysis</CardTitle>
                <CardDescription className="text-slate-400">
                  Track portfolio performance and returns for each update period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-slate-300">Date</TableHead>
                        <TableHead className="text-right text-slate-300">Portfolio Value</TableHead>
                        <TableHead className="text-right text-slate-300">Period Gain/Loss</TableHead>
                        <TableHead className="text-right text-slate-300">Period Return</TableHead>
                        <TableHead className="text-right text-slate-300">Total Gain/Loss</TableHead>
                        <TableHead className="text-right text-slate-300">Return Till Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plData.map((row, index) => (
                        <TableRow key={index} className="border-white/10 hover:bg-white/5">
                          <TableCell className="font-medium text-white">
                            {new Date(row.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-white">
                            {formatCurrency(row.value)}
                          </TableCell>
                          <TableCell
                            className={`text-right font-semibold ${row.periodGain >= 0 ? "text-emerald-400" : "text-red-400"}`}
                          >
                            {row.periodGain >= 0 ? "+" : "-"}
                            {formatCurrency(Math.abs(row.periodGain))}
                          </TableCell>
                          <TableCell
                            className={`text-right font-semibold ${Number(row.periodReturn) >= 0 ? "text-emerald-400" : "text-red-400"}`}
                          >
                            {formatPercentage(Number(row.periodReturn))}
                          </TableCell>
                          <TableCell
                            className={`text-right font-semibold ${row.totalGain >= 0 ? "text-emerald-400" : "text-red-400"}`}
                          >
                            {row.totalGain >= 0 ? "+" : "-"}
                            {formatCurrency(Math.abs(row.totalGain))}
                          </TableCell>
                          <TableCell
                            className={`text-right font-semibold ${Number(row.totalReturn) >= 0 ? "text-emerald-400" : "text-red-400"}`}
                          >
                            {formatPercentage(Number(row.totalReturn))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )
        }

        {/* Manage Portfolio Form */}
        <Card className="mb-8 border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Manage Portfolio</CardTitle>
            <CardDescription className="text-slate-400">
              Add new portfolio values or create a new portfolio for this investor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ManageInvestorForm investorId={id} portfolios={portfolios || []} />
          </CardContent>
        </Card>

        {/* Portfolios List */}
        <Card className="border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Portfolios</CardTitle>
            <CardDescription className="text-slate-400">This investor's managed portfolios</CardDescription>
          </CardHeader>
          <CardContent>
            {portfolios && portfolios.length > 0 ? (
              <div className="space-y-4">
                {portfolios.map((portfolio) => {
                  const portfolioValueData = portfolioValues?.filter((v) => v.portfolio_id === portfolio.id) || []
                  const latestPortfolioValue = portfolioValueData.slice(-1)[0]

                  return (
                    <div
                      key={portfolio.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 p-4"
                    >
                      <div>
                        <p className="font-medium text-white">{portfolio.portfolio_name}</p>
                        <p className="text-sm text-slate-400">
                          Created {new Date(portfolio.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {latestPortfolioValue && (
                        <div className="text-right">
                          <p className="font-semibold text-white">
                            $
                            {Number(latestPortfolioValue.value).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                          <p className="text-sm text-slate-400">
                            {new Date(latestPortfolioValue.date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-slate-400">No portfolios for this investor yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div >
    </div >
  )
}
