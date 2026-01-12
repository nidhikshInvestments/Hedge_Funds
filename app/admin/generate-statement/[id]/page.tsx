import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { calculateMonthlyPerformanceV2, calculatePortfolioMetrics } from "@/lib/portfolio-calculations-v2"
import { PrintHandler } from "./print-handler"

export default async function GenerateStatementPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (userData?.role !== "admin") {
    redirect("/investor")
  }

  // Fetch portfolio data
  const { data: portfolio, error: portfolioError } = await supabase
    .from("portfolios")
    .select("*")
    .eq("id", params.id)
    .single()

  if (portfolioError) {
    console.error("Error fetching portfolio:", portfolioError)
  }

  if (!portfolio) {
    console.error("Portfolio not found for ID:", params.id)
    redirect("/admin")
  }

  // Fetch investor data separately to avoid fragile FK joins
  const { data: investor, error: investorError } = await supabase
    .from("users")
    .select("full_name, email, phone")
    .eq("id", portfolio.investor_id)
    .single()

  if (investorError) {
    console.error("Error fetching investor:", investorError)
  }

  // Fetch portfolio values and cash flows
  const { data: portfolioValues } = await supabase
    .from("portfolio_values")
    .select("*")
    .eq("portfolio_id", params.id)
    .order("date", { ascending: true })

  const { data: cashFlows } = await supabase
    .from("cash_flows")
    .select("*")
    .eq("portfolio_id", params.id)
    .order("date", { ascending: true })

  const currentValue = portfolioValues?.[portfolioValues.length - 1]?.value || 0
  const metrics = calculatePortfolioMetrics(currentValue, cashFlows || [], portfolioValues || [])
  const monthlyPerformance = calculateMonthlyPerformanceV2(portfolioValues || [], cashFlows || [])

  const statementDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="relative min-h-screen overflow-hidden">
      <PrintHandler />

      <div className="absolute inset-0 bg-black">
        <div className="absolute left-1/4 top-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-r from-amber-500/30 to-yellow-600/30 blur-3xl" />
      </div>

      <nav className="relative z-10 border-b border-white/10 bg-slate-950/50 backdrop-blur-xl print:hidden">
        <div className="container mx-auto flex h-20 items-center justify-between">
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
          <div className="flex gap-3">
            <Link href={`/admin/generate-statement/${params.id}?print=true`}>
              <Button className="gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 font-semibold text-white hover:from-amber-600 hover:to-yellow-700">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:bg-white/10 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto max-w-5xl py-10" id="statement-content">
        {/* Statement Header */}
        <Card className="mb-6 border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl print:border-gray-300 print:bg-white">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="relative h-20 w-20 rounded-xl overflow-hidden">
                <Image src="/images/nidhiksh-logo.jpg" alt="Nidhiksh Investments" fill className="object-contain" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold text-white print:text-black">Portfolio Statement</CardTitle>
            <p className="text-slate-400 print:text-gray-600">Nidhiksh Investments</p>
            <p className="text-sm text-slate-500 print:text-gray-500">Statement Date: {statementDate}</p>
          </CardHeader>
        </Card>

        {/* Investor Information */}
        <Card className="mb-6 border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl print:border-gray-300 print:bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white print:text-black">Investor Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-400 print:text-gray-600">Name</p>
              <p className="text-lg font-semibold text-white print:text-black">{investor?.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 print:text-gray-600">Email</p>
              <p className="text-lg font-semibold text-white print:text-black">{investor?.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 print:text-gray-600">Phone</p>
              <p className="text-lg font-semibold text-white print:text-black">{investor?.phone}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 print:text-gray-600">Investment Start Date</p>
              <p className="text-lg font-semibold text-white print:text-black">
                {portfolio.start_date
                  ? new Date(portfolio.start_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                  : "Not set"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Summary */}
        <Card className="mb-6 border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl print:border-gray-300 print:bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white print:text-black">Portfolio Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-slate-400 print:text-gray-600">Current Value</p>
              <p className="text-2xl font-bold text-white print:text-black">
                ${metrics.currentValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400 print:text-gray-600">Net Contributions</p>
              <p className="text-2xl font-bold text-white print:text-black">
                ${metrics.netContributions.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400 print:text-gray-600">Total Gain/Loss</p>
              <p
                className={`text-2xl font-bold ${metrics.totalPnL >= 0 ? "text-green-400 print:text-green-600" : "text-red-400 print:text-red-600"
                  }`}
              >
                {metrics.totalPnL >= 0 ? "+" : ""}$
                {Math.abs(metrics.totalPnL).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Performance */}
        <Card className="mb-6 border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl print:border-gray-300 print:bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white print:text-black">Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 print:border-gray-300">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400 print:text-gray-600">
                      Month
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400 print:text-gray-600">
                      Start Value
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400 print:text-gray-600">
                      Net Flows
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400 print:text-gray-600">
                      End Value
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400 print:text-gray-600">
                      Monthly P&L
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400 print:text-gray-600">
                      Return %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyPerformance.map((row, idx) => (
                    <tr key={idx} className="border-b border-white/5 print:border-gray-200">
                      <td className="px-4 py-3 text-sm font-medium text-white print:text-black">
                        {new Date(row.startDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-300 print:text-gray-700">
                        ${row.startValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td
                        className={`px-4 py-3 text-right text-sm font-semibold ${row.netFlow >= 0
                          ? "text-blue-400 print:text-blue-600"
                          : "text-orange-400 print:text-orange-600"
                          }`}
                      >
                        {row.netFlow >= 0 ? "+" : ""}$
                        {Math.abs(row.netFlow).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-300 print:text-gray-700">
                        ${row.endValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td
                        className={`px-4 py-3 text-right text-sm font-semibold ${row.pnl >= 0 ? "text-green-400 print:text-green-600" : "text-red-400 print:text-red-600"
                          }`}
                      >
                        {row.pnl >= 0 ? "+" : ""}$
                        {Math.abs(row.pnl).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td
                        className={`px-4 py-3 text-right text-sm font-semibold ${row.returnPct >= 0 ? "text-green-400 print:text-green-600" : "text-red-400 print:text-red-600"
                          }`}
                      >
                        {row.returnPct >= 0 ? "+" : ""}
                        {row.returnPct.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl print:border-gray-300 print:bg-white">
          <CardContent className="py-6">
            <p className="text-xs text-slate-500 print:text-gray-500">
              This statement is provided for informational purposes only. Past performance is not indicative of future
              results. Please contact Nidhiksh Investments for any questions or discrepancies.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
