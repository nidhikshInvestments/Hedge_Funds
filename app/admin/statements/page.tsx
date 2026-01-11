import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { DashboardFooter } from "@/components/dashboard-footer"
import { ArrowLeft, FileText, Download } from "lucide-react"
import Image from "next/image"

export default async function StatementsPage() {
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

  // Get all investors with their portfolios
  const { data: investors } = await supabase
    .from("users")
    .select("*")
    .eq("role", "investor")
    .order("full_name", { ascending: true })

  // Get all portfolios
  const { data: portfolios } = await supabase.from("portfolios").select("*")

  // Get latest portfolio values
  const portfolioIds = portfolios?.map((p) => p.id) || []
  const { data: allPortfolioValues } = await supabase
    .from("portfolio_values")
    .select("*")
    .in("portfolio_id", portfolioIds)
    .order("date", { ascending: false })

  // Map latest value for each portfolio
  const latestValues = new Map()
  allPortfolioValues?.forEach((value) => {
    if (!latestValues.has(value.portfolio_id)) {
      latestValues.set(value.portfolio_id, value.value)
    }
  })

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-black">
        <div className="absolute left-1/4 top-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-r from-amber-500/30 to-yellow-600/30 blur-3xl" />
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
            <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:bg-white/10 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Button>
          </Link>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto max-w-6xl py-10">
        <div className="mb-10">
          <h1 className="text-5xl font-bold tracking-tight text-white">Portfolio Statements</h1>
          <p className="mt-2 text-lg text-slate-400">Generate and download statements for all investors</p>
        </div>

        <Card className="border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Available Statements</CardTitle>
            <CardDescription className="text-slate-400">
              Select an investor to view or download their portfolio statement
            </CardDescription>
          </CardHeader>
          <CardContent>
            {investors && investors.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableHead className="text-slate-300">Investor Name</TableHead>
                      <TableHead className="text-slate-300">Email</TableHead>
                      <TableHead className="text-slate-300">Phone</TableHead>
                      <TableHead className="text-slate-300">Current Value</TableHead>
                      <TableHead className="text-slate-300">Portfolios</TableHead>
                      <TableHead className="text-right text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investors.map((investor) => {
                      const investorPortfolios = portfolios?.filter((p) => p.investor_id === investor.id) || []
                      const primaryPortfolio = investorPortfolios[0]
                      const currentValue = primaryPortfolio ? latestValues.get(primaryPortfolio.id) || 0 : 0

                      return (
                        <TableRow key={investor.id} className="border-white/10 hover:bg-white/5">
                          <TableCell className="font-medium text-white">
                            {investor.full_name || "Unnamed Investor"}
                          </TableCell>
                          <TableCell className="text-slate-300">{investor.email}</TableCell>
                          <TableCell className="text-slate-300">{investor.phone || "N/A"}</TableCell>
                          <TableCell className="font-semibold text-white">
                            ${Number(currentValue).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-slate-300">{investorPortfolios.length}</TableCell>
                          <TableCell className="text-right">
                            {primaryPortfolio ? (
                              <div className="flex justify-end gap-2">
                                <Link href={`/admin/generate-statement/${primaryPortfolio.id}`} target="_blank">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-2 border-white/20 bg-slate-900/50 text-white hover:bg-slate-800/50"
                                  >
                                    <FileText className="h-4 w-4" />
                                    View
                                  </Button>
                                </Link>
                                <Link
                                  href={`/admin/generate-statement/${primaryPortfolio.id}?print=true`}
                                  target="_blank"
                                >
                                  <Button
                                    size="sm"
                                    className="gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white hover:from-amber-600 hover:to-yellow-700"
                                  >
                                    <Download className="h-4 w-4" />
                                    Download
                                  </Button>
                                </Link>
                              </div>
                            ) : (
                              <span className="text-sm text-slate-500">No portfolio</span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-amber-600/20">
                  <FileText className="h-12 w-12 text-purple-400" />
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-white">No Statements Available</h3>
                <p className="text-center text-slate-400">
                  Statements will be available once investors are added to the system.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <DashboardFooter />
    </div>
  )
}
