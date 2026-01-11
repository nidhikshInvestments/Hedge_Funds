import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, ArrowLeft } from "lucide-react"
import Link from "next/link"
import AddValueForm from "@/components/add-value-form"
import { DashboardFooter } from "@/components/dashboard-footer"

export default async function AddValuePage() {
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

  const { data: portfolios, error: portfoliosError } = await supabase.from("portfolios").select(`
      *,
      users!portfolios_investor_id_fkey(full_name, email)
    `)

  console.log("[v0] Portfolios data:", portfolios)
  console.log("[v0] Portfolios error:", portfoliosError)
  console.log("[v0] Number of portfolios:", portfolios?.length || 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-amber-500" />
            <span className="text-xl font-semibold tracking-tight text-white">Nidhiksh Investments - Admin</span>
          </div>
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      {/* Form Content */}
      <div className="container mx-auto py-8">
        <div className="mx-auto max-w-2xl">
          <Card className="border-white/10 bg-slate-900/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Add Portfolio Value</CardTitle>
              <CardDescription className="text-gray-400">
                Update an investor's portfolio value for tracking and reporting
              </CardDescription>
            </CardHeader>
            <CardContent>
              {portfoliosError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 mb-4">
                  <p className="font-semibold">Error loading portfolios:</p>
                  <p className="text-sm">{portfoliosError.message}</p>
                </div>
              )}
              {!portfolios || portfolios.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-white/10 bg-slate-800/30 p-8 text-center">
                  <p className="text-gray-400 mb-4">No portfolios found.</p>
                  <p className="text-sm text-gray-500 mb-4">
                    You need to create a portfolio for an investor first before adding values.
                  </p>
                  <Link href="/admin">
                    <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 hover:opacity-90">
                      Go to Admin Dashboard
                    </Button>
                  </Link>
                </div>
              ) : (
                <AddValueForm portfolios={portfolios} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <DashboardFooter />
    </div>
  )
}
