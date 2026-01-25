import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, Users, DollarSign, Plus, Briefcase, ArrowRight, Mail, FileText, FileDown } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Footer } from "@/components/footer"
import { InvestorList } from "@/components/admin/investor-list"
import { BulkImportModal } from "@/components/admin/bulk-import-modal"

export default async function AdminDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Force Password Change Check
  if (user.user_metadata?.force_password_change) {
    redirect("/update-password")
  }

  // Get admin data
  const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (userData?.role !== "admin") {
    redirect("/investor")
  }

  // Get all investors
  const { data: investors } = await supabase
    .from("users")
    .select("*")
    .eq("role", "investor")
    .order("created_at", { ascending: false })

  // Get all portfolios
  const { data: portfolios } = await supabase.from("portfolios").select("*")

  // Get latest portfolio values
  const portfolioIds = portfolios?.map((p) => p.id) || []
  const { data: allPortfolioValues } = await supabase
    .from("portfolio_values")
    .select("*")
    .in("portfolio_id", portfolioIds)
    .order("date", { ascending: false })

  // Calculate total AUM
  const latestValues = new Map()
  allPortfolioValues?.forEach((value) => {
    if (!latestValues.has(value.portfolio_id)) {
      latestValues.set(value.portfolio_id, value.value)
    }
  })
  const totalAUM = Array.from(latestValues.values()).reduce((sum, value) => sum + Number(value), 0)

  const { count: messagesCount } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("status", "new")

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/login")
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-red-500 to-blue-500">
      <div className="absolute inset-0 bg-black">
        <div className="absolute left-1/4 top-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-r from-amber-500/30 to-yellow-600/30 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-r from-yellow-500/30 to-amber-600/30 blur-3xl animation-delay-2000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
        <div className="container mx-auto flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 cursor-pointer">
            <div className="relative h-14 w-14 rounded-xl overflow-hidden">
              <Image
                src="/images/nidhiksh-logo.jpg"
                alt="Nidhiksh Investments Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                Nidhiksh Investments
              </span>
              <span className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                Admin
              </span>
            </div>
          </Link>
          <form action={handleSignOut}>
            <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-white/10 hover:text-white">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="relative z-10 container mx-auto py-10">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-5xl font-bold tracking-tight text-white">
              Administration Panel
            </h1>
            <p className="mt-2 text-lg text-slate-400">
              Manage investor portfolios and update performance data
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <BulkImportModal />
            <Link href="/admin/add-investor">
              <Button
                size="lg"
                className="h-12 gap-2 bg-gradient-to-r from-green-500 to-emerald-600 px-6 font-semibold text-white hover:from-green-600 hover:to-emerald-700"
              >
                <Plus className="h-5 w-5" />
                Add New Investor
              </Button>
            </Link>
            <Link href="/admin/statements">
              <Button
                size="lg"
                variant="outline"
                className="h-12 gap-2 border-white/20 bg-slate-900/50 backdrop-blur-xl font-semibold text-white hover:bg-slate-800/50"
              >
                <FileText className="h-5 w-5" />
                Statements
              </Button>
            </Link>
            <Link href="/admin/messages">
              <Button
                size="lg"
                variant="outline"
                className="h-12 gap-2 border-white/20 bg-slate-900/50 backdrop-blur-xl font-semibold text-white hover:bg-slate-800/50 relative"
              >
                <Mail className="h-5 w-5" />
                Messages
                {(messagesCount ?? 0) > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black">
                    {messagesCount}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/admin/add-value">
              <Button
                size="lg"
                className="h-12 gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 px-6 font-semibold text-white hover:from-amber-600 hover:to-yellow-700"
              >
                <Plus className="h-5 w-5" />
                Update Portfolio Values
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-10 grid gap-6 md:grid-cols-3">
          <Card className="border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-400">Total AUM</CardTitle>
              <div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-amber-600/20 p-3">
                <DollarSign className="h-6 w-6 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl lg:text-4xl font-bold text-white break-words">
                ${totalAUM.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="mt-2 text-sm text-slate-400">Assets under management</p>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-400">
                Active Investors
              </CardTitle>
              <div className="rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-600/20 p-3">
                <Users className="h-6 w-6 text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl lg:text-4xl font-bold text-white break-words">
                {investors?.filter((inv: any) =>
                  portfolios?.some((p: any) => p.investor_id === inv.id && (latestValues.get(p.id) || 0) > 0)
                ).length || 0}
              </div>
              <p className="mt-2 text-sm text-slate-400">Registered accounts</p>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-400">Portfolios</CardTitle>
              <div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-amber-600/20 p-3">
                <Briefcase className="h-6 w-6 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl lg:text-4xl font-bold text-white break-words">{portfolios?.length || 0}</div>
              <p className="mt-2 text-sm text-slate-400">Managed portfolios</p>
            </CardContent>
          </Card>
        </div>

        {/* Investors List */}
        <Card className="mb-10 border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white">Investor Accounts</CardTitle>
            <CardDescription className="text-base text-slate-400">
              Manage all registered investors and update their portfolio performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {investors && investors.length > 0 ? (
              <InvestorList
                investors={investors.map(inv => {
                  const invPortfolios = portfolios?.filter(p => p.investor_id === inv.id) || []
                  const invPortfolioIds = invPortfolios.map(p => p.id)
                  const invValues = allPortfolioValues?.filter(v => invPortfolioIds.includes(v.portfolio_id)) || []

                  return {
                    ...inv,
                    portfolios: invPortfolios,
                    latestValue: invValues.length > 0 ? invValues[0].value : undefined
                  }
                })}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-amber-600/20">
                  <Users className="h-12 w-12 text-purple-400" />
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-white">No Investors Yet</h3>
                <p className="text-center text-slate-400">
                  Investor accounts will appear here once they are created in the system.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
